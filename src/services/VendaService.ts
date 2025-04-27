import { getCustomRepository, getRepository } from "typeorm";
import { VendaRepository } from "../repositories/VendaRepository";
import { Venda } from "../entities/Venda";
import { VendaItem } from "../entities/VendaItem";
import { StatusVenda } from "../entities/StatusVenda";
import { Cupom } from "../entities/Cupom";
import { LivroService } from "./LivroService";
import { Cliente } from "../entities/Cliente";
import { CupomRepository } from "../repositories/CupomRepository";
import { LivroRepository } from "../repositories/LivroRepository";
import { EstoqueService } from "./EstoqueService";
import { Pagamento } from "../entities/Pagamento";

class VendaService {
  private vendaRepository = getCustomRepository(VendaRepository);
  private cupomRepository = getCustomRepository(CupomRepository);
  private estoqueService = new EstoqueService();
  private livroRepository = getCustomRepository(LivroRepository);


  // Criação de venda com suporte a cupons
  async criarVenda(vendaData: Partial<Venda>, cupomCodigo?: string): Promise<Venda> {
    // Valida estoque
    const itensValidos = await this.validarEstoqueItens(vendaData.itens);
    if (!itensValidos) {
      throw new Error("Itens sem estoque disponível");
    }

    // Calcula totais
    let total = await this.calcularTotalVenda(vendaData.itens);
    let desconto = 0;
    
    // Aplica cupom se fornecido
    let cupomUtilizado: Cupom | null = null;
    if (cupomCodigo) {
      const resultadoValidacao = await this.validarEAplicarCupom(cupomCodigo, vendaData.cliente.id, total);
      if (!resultadoValidacao.valido) {
        throw new Error(resultadoValidacao.mensagem);
      }
      desconto = resultadoValidacao.cupom?.valor || 0;
      total = resultadoValidacao.novoTotal;
      cupomUtilizado = resultadoValidacao.cupom;
    }

    // Cria a venda
    const venda = await this.vendaRepository.createAndSave({
      cliente: vendaData.cliente,
      enderecoEntrega: vendaData.enderecoEntrega,
      itens: vendaData.itens,
      pagamentos: [],
      trocas: [],
      total,
      descontoAplicado: desconto,
      status: StatusVenda.EM_PROCESSAMENTO,
      cupomUtilizado: cupomUtilizado
    });
    
    

    // Reserva estoque
    await this.reservarEstoque(vendaData.itens);

    // Marca cupom como utilizado
    if (cupomUtilizado) {
      await this.cupomRepository.marcarComoUtilizado(cupomUtilizado.id);
    }

    return venda;
}

  // Valida e aplica cupom na venda
  private async validarEAplicarCupom(
    codigo: string, 
    clienteId: string, 
    valorTotal: number
  ): Promise<{
    valido: boolean;
    cupom?: Cupom;
    novoTotal?: number;
    mensagem?: string;
  }> {
    const cupom = await this.cupomRepository.findByCodigo(codigo);
    
    if (!cupom) {
      return { valido: false, mensagem: 'Cupom não encontrado' };
    }
  
    if (cupom.utilizado) {
      return { valido: false, mensagem: 'Cupom já utilizado' };
    }
  
    if (cupom.validade < new Date()) {
      return { valido: false, mensagem: 'Cupom expirado' };
    }
  
    if (cupom.valorMinimoCompra && valorTotal < cupom.valorMinimoCompra) {
      return { valido: false, mensagem: `Valor mínimo da compra não atingido (mínimo: ${cupom.valorMinimoCompra})` };
    }
  
    const desconto = cupom.valor;
    const novoTotal = Math.max(0, valorTotal - desconto);
  
    // Verifica se o valor restante atende ao mínimo para pagamento com cartão (RN0035)
    if (novoTotal > 0 && novoTotal < 10) {
      return { 
        valido: false, 
        mensagem: 'O valor restante após aplicar o cupom deve ser no mínimo R$ 10,00 quando pago com cartão' 
      };
    }
  
    return {
      valido: true,
      cupom,
      novoTotal,
      mensagem: 'Cupom aplicado com sucesso'
    };
  }


    async processarPagamento(pagamento: Pagamento): Promise<boolean> {
      console.log("Simulando processamento de pagamento...");
  
      // Exemplo de regra: pagamentos acima de R$ 1000 têm 20% de chance de falhar
      const valor = pagamento.valor || 0;
  
      if (valor > 1000) {
        const aprovado = Math.random() > 0.2;
        console.log(`Pagamento ${aprovado ? 'aprovado' : 'recusado'} (valor alto)`);
        return aprovado;
      }
  
      // Senão, aprova automaticamente
      console.log("Pagamento aprovado (valor baixo)");
      return true;
    }

  // Finalização de compra com pagamento (RF0037)
  async finalizarCompra(
    vendaId: string,
    formaPagamento: 'CARTAO' | 'CUPOM' | 'MISTO',
    detalhesPagamento: {
      numeroCartao?: string;
      bandeira?: string;
      parcelas?: number;
      valorPagoCartao?: number;
    }
  ): Promise<Venda> {
    // 1. Busca a venda com todos os relacionamentos necessários
    const venda = await this.vendaRepository.findById(vendaId, [
      'itens',
      'itens.livro',
      'pagamentos',
      'cliente',
      'cupomUtilizado'
    ]);
  
    // 2. Validações iniciais
    if (venda.status !== StatusVenda.EM_PROCESSAMENTO) {
      throw new Error("Só é possível finalizar compras em processamento");
    }
  
    // 3. Validação específica para pagamento misto (RN0035)
    if (formaPagamento === 'MISTO') {
      if (!detalhesPagamento.valorPagoCartao || detalhesPagamento.valorPagoCartao < 10) {
        throw new Error("Pagamento misto requer mínimo de R$ 10,00 no cartão");
      }
    }
  
    // 4. Processa o pagamento
    const pagamento = new Pagamento();
    pagamento.valor = venda.total - venda.descontoAplicado;
    pagamento.tipo = formaPagamento;
    pagamento.status = 'PENDENTE'; // Será atualizado após confirmação
  
    // 5. Adiciona detalhes específicos para cartão
    if (formaPagamento === 'CARTAO' || formaPagamento === 'MISTO') {
      if (!detalhesPagamento.numeroCartao || !detalhesPagamento.bandeira) {
        throw new Error("Dados do cartão incompletos");
      }
  
      pagamento.cartaoId;
      pagamento.valor = formaPagamento === 'MISTO' 
        ? detalhesPagamento.valorPagoCartao 
        : venda.total - venda.descontoAplicado;
    }
  
    // 6. Adiciona o pagamento à venda
    venda.pagamentos = venda.pagamentos || [];
    venda.pagamentos.push(pagamento);
  
    // 7. Atualiza status da venda (RN0037)
    venda.status = StatusVenda.PENDENTE;
    await this.vendaRepository.save(venda);
  
    try {
      // 8. Simula/Integra com gateway de pagamento
      const pagamentoAprovado = await this.processarPagamento(pagamento);
      
      if (pagamentoAprovado) {
        // 9. Atualiza status se aprovado (RN0038)
        venda.status = StatusVenda.APROVADA;
        pagamento.status = 'APROVADO';
        venda.dataVenda = new Date();
  
        // 10. Baixa estoque (RN0053)
        await this.estoqueService.darBaixaEstoqueVenda(venda.itens);
  
        // 11. Marca cupom como utilizado se aplicável
        if (venda.cupomUtilizado) {
          await this.cupomRepository.marcarComoUtilizado(venda.cupomUtilizado.id);
        }
  
        // 12. Gera código de rastreio (RF0038)
        venda.codigoRastreio = this.gerarCodigoRastreio();
  
        // 13. Salva todas as alterações
        const vendaAtualizada = await this.vendaRepository.save(venda);
  
        // 14. Dispara evento de confirmação (opcional)
        //this.eventEmitter.emit('venda.aprovada', vendaAtualizada);
  
        return vendaAtualizada;
      } else {
        // 15. Fluxo de pagamento recusado (RN0038)
        venda.status = StatusVenda.REPROVADA;
        pagamento.status = 'REPROVADA';
        await this.vendaRepository.save(venda);
        throw new Error("Pagamento não autorizado");
      }
    } catch (error) {
      // 16. Tratamento de erros
      venda.status = StatusVenda.REPROVADA;
      await this.vendaRepository.save(venda);
      throw new Error(`Erro ao processar pagamento: ${error.message}`);
    }
  }
  
  // Método auxiliar para gerar código de rastreio
  private gerarCodigoRastreio(): string {
    return 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  

  // Processamento de troca (RF0040, RF0041, RF0044)
  async processarTroca(
    vendaId: string,
    itensTroca: Array<{itemId: string, quantidade: number}>,
    motivo: string
  ): Promise<{venda: Venda; cupomTroca?: Cupom}> {
    const venda = await this.vendaRepository.findById(vendaId, ['itens', 'itens.livro', 'cliente']);
    
    // Valida status (RN0043)
    if (venda.status !== StatusVenda.ENTREGUE) {
      throw new Error("Só é possível solicitar troca para vendas entregues");
    }

    // Valida itens
    this.validarItensTroca(venda, itensTroca);

    // Calcula valor da troca
    const valorTroca = await this.calcularValorTroca(venda, itensTroca);
    
    // Gera cupom de troca (RF0044, RN0036)
    const cupomTroca = await this.cupomRepository.gerarCupomTroca(
      venda.cliente,
      valorTroca,
      motivo
    );

    // Atualiza status da venda
    venda.status = StatusVenda.TROCA_AUTORIZADA;
    await this.vendaRepository.save(venda);

    return { venda, cupomTroca };
  }

  // Confirmação de recebimento de troca (RF0043)
  async confirmarRecebimentoTroca(
    vendaId: string,
    itensRecebidos: Array<{itemId: string, quantidade: number}>
  ): Promise<Venda> {
    const venda = await this.vendaRepository.findById(vendaId, ['itens', 'itens.livro']);
    
    if (venda.status !== StatusVenda.TROCA_AUTORIZADA) {
      throw new Error("Só é possível confirmar recebimento para trocas autorizadas");
    }

    // Valida itens recebidos
    this.validarItensTroca(venda, itensRecebidos);

    // Atualiza estoque (RF0054)
    await Promise.all(
      itensRecebidos.map(async ({itemId, quantidade}) => {
        const item = venda.itens.find(i => i.id === itemId);
        if (item) {
          await this.estoqueService.reentradaPorTroca(item.livro.id, quantidade);
        }
      })
    );

    // Atualiza status
    venda.status = StatusVenda.TROCA_CONCLUIDA;
    return this.vendaRepository.save(venda);
  }

  // Métodos auxiliares melhorados
  private async calcularTotalVenda(itens: VendaItem[]): Promise<number> {
    const precos = await Promise.all(
      itens.map(async item => {
        const livro = await this.livroRepository.findById(item.livro.id);
        return livro.valorVenda * item.quantidade;
      })
    );
    
    return precos.reduce((total, preco) => total + preco, 0);
  }

  private async reservarEstoque(itens: VendaItem[]): Promise<void> {
    await Promise.all(
      itens.map(item => 
        this.estoqueService.reservarEstoque(item.livro.id, item.quantidade)
      )
    );
  }

  private async validarEstoqueItens(itens: VendaItem[]): Promise<boolean> {
    const resultados = await Promise.all(
      itens.map(item => 
        this.estoqueService.verificarDisponibilidade(item.livro.id, item.quantidade)
      )
    );
    return resultados.every(result => result);
  }

  private validarItensTroca(venda: Venda, itens: Array<{itemId: string, quantidade: number}>): void {
    itens.forEach(itemSolicitado => {
      const itemVenda = venda.itens.find(i => i.id === itemSolicitado.itemId);
      
      if (!itemVenda) {
        throw new Error(`Item ${itemSolicitado.itemId} não encontrado na venda`);
      }
      
      if (itemSolicitado.quantidade > itemVenda.quantidade) {
        throw new Error(`Quantidade solicitada maior que a comprada`);
      }
    });
  }

  private async calcularValorTroca(venda: Venda, itens: Array<{itemId: string, quantidade: number}>): Promise<number> {
    const valores = await Promise.all(
      itens.map(async ({itemId, quantidade}) => {
        const itemVenda = venda.itens.find(i => i.id === itemId);
        if (!itemVenda) return 0;
        
        const livro = await this.livroRepository.findById(itemVenda.livro.id);
        return livro.valorVenda * quantidade;
      })
    );
    
    return valores.reduce((total, valor) => total + valor, 0);
  }
}

export { VendaService };