// src/cart/cart.service.ts
import { getCustomRepository } from 'typeorm';
import { EstoqueService } from './EstoqueService';
import { CarrinhoRepository, ItemCarrinhoRepository } from '../repositories/CarrinhoRepository';
import { LivroService } from './LivroService';
import { Cliente } from '../entities/Cliente';
import { Carrinho } from '../entities/Carrinho';
import { ItemCarrinho } from '../entities/ItemCarrinho';
import { VendaService } from './VendaService';
import { VendaItem } from '../entities/VendaItem';
import { StatusVenda } from '../entities/StatusVenda';
import { Pagamento } from '../entities/Pagamento';
import { Venda } from '../entities/Venda';
import { error } from 'console';
import { VendaRepository } from '../repositories/VendaRepository';
import { CartaoService } from './CartaoService';
import { PagamentoRepository } from '../repositories/PagamentoRepository';
import { CupomRepository } from '../repositories/CupomRepository';



export class CarrinhoService {
    private estoqueService= new EstoqueService()
    private cupomRepository = getCustomRepository(CupomRepository)
    private vendaRepository = getCustomRepository(VendaRepository)
    private vendaService= new VendaService();
    private carrinhoRepository= getCustomRepository(CarrinhoRepository);
    private itemCarrinhoRepository= getCustomRepository(ItemCarrinhoRepository);
    private livroService = new LivroService();
    private cartaoService = new CartaoService();
    private pagamentoRepository = getCustomRepository(PagamentoRepository)

    async getOrCreateActiveCart(cliente: Cliente): Promise<Carrinho> {
      let carrinho = await this.carrinhoRepository.findActiveCartByCliente(cliente);
      
      if (!carrinho) {
          carrinho = await this.carrinhoRepository.createCart(cliente);
          carrinho.itens = []; // Initialize items array
      } else if (!carrinho.itens) {
          carrinho.itens = []; // Ensure items array exists
      }
  
      return carrinho;
  }

  async addItemToCart(cliente: Cliente, livroId: string, quantidade: number): Promise<Carrinho> {
    // Validar estoque (RN0031)
    const disponivel = await this.estoqueService.verificarDisponibilidade(livroId, quantidade);
    if (!disponivel) {
        throw new Error('Quantidade solicitada não disponível em estoque');
    }

    const livro = await this.livroService.findById(livroId);
    if (!livro) {
        throw new Error('Livro não encontrado');
    }

    const carrinho = await this.getOrCreateActiveCart(cliente);
    
    // Initialize items array if it doesn't exist
    if (!carrinho.itens) {
        carrinho.itens = [];
    }

    // Rest of your method remains the same...
    let item = await this.itemCarrinhoRepository.findItemByCartAndBook(carrinho.id, livroId);
    
    if (item) {
        item.quantidade += quantidade;
    } else {
        item = new ItemCarrinho();
        item.livro = livro;
        item.quantidade = quantidade;
        item.carrinho = carrinho;
        carrinho.itens.push(item);
    }

    await this.estoqueService.reservarEstoque(livroId, quantidade);
    await this.itemCarrinhoRepository.save(item);
    return this.carrinhoRepository.save(carrinho);
}
  async updateItemQuantity(cliente: Cliente, itemId: string, quantidade: number): Promise<ItemCarrinho> {
    if (quantidade <= 0) {
      throw new error('Quantidade deve ser maior que zero');
    }

    const carrinho = await this.getOrCreateActiveCart(cliente);
    const item = carrinho.itens.find(i => i.id === itemId);
    
    if (!item) {
      throw new error('Item não encontrado no carrinho');
    }

    // Validar estoque para nova quantidade (RN0031)
    const disponivel = await this.estoqueService.verificarDisponibilidade(
      item.livro.id, 
      quantidade - item.quantidade
    );
    
    if (!disponivel) {
      throw new error('Quantidade solicitada não disponível em estoque');
    }

    // Atualizar bloqueio no estoque
    await this.estoqueService.reservarEstoque(
      item.livro.id, 
      item.quantidade, 
    );

    item.quantidade = quantidade;
    return this.itemCarrinhoRepository.updateItemQuantity(item, quantidade);
  }

  async removeItemFromCart(cliente: Cliente, itemId: string): Promise<void> {
    const carrinho = await this.getOrCreateActiveCart(cliente);
    const item = carrinho.itens.find(i => i.id === itemId);
    
    if (!item) {
      throw new error('Item não encontrado no carrinho');
    }

    // Liberar estoque bloqueado (RN0044)
    await this.estoqueService.liberarReservaEstoque(item.livro.id, item.quantidade);

    await this.itemCarrinhoRepository.remove(item);
  }

  async clearCart(cliente: Cliente): Promise<void> {
    const carrinho = await this.getOrCreateActiveCart(cliente);
    
    // Liberar todos os itens bloqueados
    await Promise.all(
      carrinho.itens.map(item => 
        this.estoqueService.liberarReservaEstoque(item.livro.id, item.quantidade)
      )
    );

    await this.itemCarrinhoRepository.remove(carrinho.itens);
    await this.carrinhoRepository.deactivateCart(carrinho);
  }

  async applyCoupon(cliente: Cliente, codigoCupom: string): Promise<Carrinho> {
    const carrinho = await this.getOrCreateActiveCart(cliente);
    
    if (carrinho.itens.length === 0) {
      throw new error('Carrinho vazio não pode ter cupom aplicado');
    }

    const total = this.calculateCartTotal(carrinho);
    const resultadoValidacao = await this.cupomRepository.validarCupomParaVenda(
      codigoCupom, 
      cliente.id, 
      total
    );

    if (!resultadoValidacao.valido) {
      throw new error(resultadoValidacao.mensagem);
    }

    // Verifica valor mínimo após desconto (RN0035)
    const totalComDesconto = total - (resultadoValidacao.cupom?.valor || 0);
    if (totalComDesconto > 0 && totalComDesconto < 10) {
      throw new error(
        'O valor restante após aplicar o cupom deve ser no mínimo R$ 10,00 quando pago com cartão'
      );
    }

    return this.carrinhoRepository.applyCoupon(
      carrinho, 
      resultadoValidacao.cupom, 
      resultadoValidacao.cupom.valor
    );
  }

  async removeCoupon(cliente: Cliente): Promise<Carrinho> {
    const carrinho = await this.getOrCreateActiveCart(cliente);
    return this.carrinhoRepository.removeCoupon(carrinho);
  }

  async checkout(cliente: Cliente, formaPagamento: 'CARTAO' | 'CUPOM' | 'MISTO', detalhesPagamento: any): Promise<any> {
    const carrinho = await this.getOrCreateActiveCart(cliente);
    
    // Check if items exists and has length
    if (!carrinho.itens || carrinho.itens.length === 0) {
        throw new Error('Carrinho vazio');
    }
    // Validate stock
    for (const item of carrinho.itens) {
        const disponivel = await this.estoqueService.verificarDisponibilidade(item.livro.id, item.quantidade);
        if (!disponivel) {
            throw new error(`Item ${item.livro.titulo} não está mais disponível na quantidade solicitada`);
        }
    }

    // Map items to sale items
    const itensVenda = carrinho.itens.map(item => {
        const itemVenda = new VendaItem();
        itemVenda.livro = item.livro;
        itemVenda.quantidade = item.quantidade;
        itemVenda.precoUnitario = item.livro.valorVenda; // Or get from cart if different
        return itemVenda;
    });

    if (!cliente.enderecos || cliente.enderecos.length === 0) {
        throw new Error('Endereço de entrega é obrigatório');
    }

    const venda = await this.vendaService.criarVenda(
        {
            cliente,
            itens: itensVenda,
            enderecoEntrega: cliente.enderecos[0]
        },
        carrinho.cupomAplicado?.codigo
    );

    // Process payment based on payment method
    // This should be implemented according to your payment processing logic
    await this.processarPagamento(venda, formaPagamento, detalhesPagamento);

    // Deactivate cart after checkout
    await this.carrinhoRepository.deactivateCart(carrinho);
    
    return { 
        message: 'Checkout realizado com sucesso', 
        vendaId: venda.id,
        total: venda.total
    };
}

  private calculateCartTotal(carrinho: Carrinho): number {
    return carrinho.itens.reduce(
      (total, item) => total + (item.livro.valorVenda * item.quantidade), 
      0
    );
  }

// Atualização no CarrinhoService
async processarPagamento(
  venda: Venda,
  formaPagamento: 'CARTAO' | 'CUPOM' | 'MISTO',
  detalhesPagamento: any
): Promise<Venda> {
  if (venda.status !== StatusVenda.EM_PROCESSAMENTO) {
    throw new Error('Venda não está no status adequado para pagamento');
  }

  try {
    // Handle coupon payment
    let valorRestante
    if ((formaPagamento === 'CUPOM' || formaPagamento === 'MISTO') && venda.cupomUtilizado) {
      await this.pagamentoRepository.criarPagamentoCupom(
        venda,
        venda.cupomUtilizado,
        venda.descontoAplicado
      );
       valorRestante = venda.total - venda.descontoAplicado;
    }

    // Handle credit card payment
    if (formaPagamento === 'CARTAO' || (formaPagamento === 'MISTO' && valorRestante > 0)) {
      if (!detalhesPagamento?.cartaoId) {
        throw new Error('Dados do cartão são obrigatórios');
      }

      const cartao = await this.cartaoService.validarCartao(
        detalhesPagamento.cartaoId,
      );

      const pagamentoCartao = await this.pagamentoRepository.criarPagamentoCartao(
        venda,
        cartao,
        valorRestante,
        'PENDENTE'
      );

      // Process with payment gateway
      const resultadoGateway = await this.processarComGateway(pagamentoCartao);
      
      await this.pagamentoRepository.atualizarStatusPagamento(
        pagamentoCartao.id,
        resultadoGateway.aprovado ? 'APROVADO' : 'REPROVADO',
        resultadoGateway.mensagem
      );
    }

    // Refresh venda status
    await this.pagamentoRepository.atualizarStatusVenda(venda.id);
    return this.vendaRepository.findOne(venda.id);

  } catch (error) {
    await this.vendaRepository.update(venda.id, { status: StatusVenda.REPROVADA });
    throw error;
  }
}

  private async processarComGateway(pagamento: Pagamento): Promise<{
    aprovado: boolean;
    mensagem?: string;
    codigoTransacao?: string;
  }> {
    // This would call your actual payment gateway
    // Mock implementation for demonstration
    return {
      aprovado: true,
      mensagem: 'Pagamento aprovado',
      codigoTransacao: 'TRANS_' + Math.random().toString(36).substring(2, 15)
    };
  }

  private determinarStatusVenda(pagamentos: Pagamento[]): StatusVenda {
    const algumReprovado = pagamentos.some(p => p.status === 'REPROVADO');
    if (algumReprovado) {
      return StatusVenda.REPROVADA;
    }

    const todosAprovados = pagamentos.every(p => p.status === 'APROVADO');
    if (todosAprovados) {
      return StatusVenda.APROVADA;
    }

    return StatusVenda.EM_PROCESSAMENTO;
  }
}