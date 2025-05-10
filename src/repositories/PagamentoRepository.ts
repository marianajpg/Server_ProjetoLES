import { EntityRepository, Repository, getConnection } from "typeorm";
import { Pagamento } from "../entities/Pagamento";
import { Venda } from "../entities/Venda";
import { StatusVenda } from "../entities/StatusVenda";
import { Cupom } from "../entities/Cupom";
import { CartaoCredito } from "../entities/CartaoCredito";
import { FindOneOptions } from "typeorm";

@EntityRepository(Pagamento)
export class PagamentoRepository extends Repository<Pagamento> {
  async criarPagamentoCartao(
    venda: Venda,
    cartao: Partial<CartaoCredito>,
    valor: number,
    status: 'PENDENTE' | 'APROVADO' | 'REPROVADO' = 'PENDENTE'
  ): Promise<Pagamento> {
    // RN0034 - Valida valor mínimo para cartão (R$ 10,00)
    if (valor > 0 && valor < 10 && !venda.cupomUtilizado) {
      throw new Error('O valor mínimo para pagamento com cartão é R$ 10,00');
    }

    const pagamento = this.create({
      tipo: 'CARTAO_CREDITO',
      valor,
      cartaoId: cartao.id,
      status,
      venda
    });

    return this.save(pagamento);
  }

  async criarPagamentoCupom(
    venda: Venda,
    cupom: Cupom,
    valor: number
  ): Promise<Pagamento> {
    // RN0033 - Valida se cupom pode ser usado
    if (valor <= 0) {
      throw new Error('Valor do cupom deve ser positivo');
    }

    const pagamento = this.create({
      tipo: 'CUPOM',
      valor,
      cupomId: cupom.id,
      status: 'APROVADO', // Cupons são sempre aprovados imediatamente
      venda
    });

    return this.save(pagamento);
  }

  async atualizarStatusPagamento(
    pagamentoId: string,
    novoStatus: 'APROVADO' | 'REPROVADO',
    motivo?: string
  ): Promise<Pagamento> {
    const pagamento = await this.findOne({
      where: { id: pagamentoId },
      relations: ['venda']
    });
    
    if (!pagamento) {
      throw new Error('Pagamento não encontrado');
    }

    // RN0038 - Atualiza status da venda conforme pagamento
    pagamento.status = novoStatus;
    await this.save(pagamento);

    // Atualiza status da venda se todos os pagamentos foram processados
    await this.atualizarStatusVenda(pagamento.venda.id);

    return pagamento;
  }

  async atualizarStatusVenda(vendaId: string): Promise<void> {
    const venda = await getConnection()
      .getRepository(Venda)
      .findOne({ 
        where: { id: vendaId }, 
        relations: ['pagamentos'] 
      });

    if (!venda) return;

    // RN0038 - Determina status da venda baseado nos pagamentos
    const algumReprovado = venda.pagamentos.some(p => p.status === 'REPROVADO');
    const todosAprovados = venda.pagamentos.every(p => p.status === 'APROVADO');
    const algumPendente = venda.pagamentos.some(p => p.status === 'PENDENTE');

    let novoStatus = venda.status;

    if (algumReprovado) {
      novoStatus = StatusVenda.REPROVADA;
    } else if (todosAprovados) {
      novoStatus = StatusVenda.APROVADA;
    } else if (algumPendente) {
      novoStatus = StatusVenda.EM_PROCESSAMENTO;
    }

    if (novoStatus !== venda.status) {
      await getConnection()
        .getRepository(Venda)
        .update(venda.id, { status: novoStatus });
    }
  }

  async encontrarPorVenda(vendaId: string): Promise<Pagamento[]> {
    return this.find({
      where: { venda: { id: vendaId } },
      relations: ['venda', 'cartao', 'cupom']
    });
  }

  async calcularTotalAprovado(vendaId: string): Promise<number> {
    const result = await this.createQueryBuilder('pagamento')
      .select('SUM(pagamento.valor)', 'total')
      .where('pagamento.vendaId = :vendaId', { vendaId })
      .andWhere('pagamento.status = :status', { status: 'APROVADO' })
      .getRawOne();

    return result.total || 0;
  }

  async verificarPagamentoCompleto(vendaId: string): Promise<boolean> {
    const venda = await getConnection()
      .getRepository(Venda)
      .findOne({ 
        where: { id: vendaId }, 
        relations: ['pagamentos'] 
      });

    if (!venda) return false;

    const totalAprovado = await this.calcularTotalAprovado(vendaId);
    return totalAprovado >= venda.total;
  }

  async processarReembolso(pagamentoId: string): Promise<Pagamento> {
    const pagamento = await this.findOne({ 
      where: { id: pagamentoId }, 
      relations: ['venda'] 
    });
    
    if (!pagamento) {
      throw new Error('Pagamento não encontrado');
    }

    if (pagamento.tipo === 'CUPOM') {
      // RN0044 - Gerar novo cupom para reembolso
      // Implementação específica para seu sistema
    }

    pagamento.status = 'REPROVADO'; // Ou status específico para reembolsado
    return this.save(pagamento);
  }
}