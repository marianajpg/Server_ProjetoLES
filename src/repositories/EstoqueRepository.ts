import { EntityRepository, Repository, Between, MoreThan } from "typeorm";
import { Estoque } from "../entities/Estoque";
import { Livro } from "../entities/Livros";
import { Fornecedor } from "../entities/Fornecedor";

@EntityRepository(Estoque)
class EstoqueRepository extends Repository<Estoque> {
  // Métodos básicos de CRUD
  async findById(id: string, relations: string[] = []): Promise<Estoque | null> {
    return this.findOne({ where: { id }, relations });
  }

  async createAndSave(estoqueData: Partial<Estoque>): Promise<Estoque> {
    // RN0061: Valida quantidade
    if (estoqueData.quantidade <= 0) {
      throw new Error("Quantidade deve ser maior que zero");
    }

    // RN0062: Valida custo unitário
    if (!estoqueData.custoUnitario || estoqueData.custoUnitario <= 0) {
      throw new Error("Custo unitário é obrigatório e deve ser maior que zero");
    }

    // RN0064: Valida data de entrada
    if (!estoqueData.dataEntrada) {
      throw new Error("Data de entrada é obrigatória");
    }

    const estoque = this.create(estoqueData);
    return this.save(estoque);
  }

  // RF0051: Entrada de itens no estoque
  async registrarEntrada(
    livroId: string,
    fornecedorId: string,
    quantidade: number,
    custoUnitario: number,
    dataEntrada: Date,
    notaFiscal?: string
  ): Promise<Estoque> {
    return this.createAndSave({
      livroId: { id: livroId } as Livro,
      fornecedor: { id: fornecedorId } as Fornecedor,
      quantidade,
      custoUnitario,
      dataEntrada,
      notaFiscal
    });
  }

  // RF0053: Dar baixa no estoque após venda
  async darBaixaEstoque(livroId: string, quantidade: number): Promise<void> {
    const estoqueDisponivel = await this.getQuantidadeDisponivel(livroId);
    
    if (estoqueDisponivel < quantidade) {
      throw new Error("Quantidade indisponível em estoque");
    }

    // Implementação FIFO (primeiros a entrar, primeiros a sair)
    const itensEstoque = await this.find({
      where: { livro: { id: livroId }, quantidade: MoreThan(0) },
      order: { dataEntrada: 'ASC' },
      relations: ['livro']
    });

    let quantidadeRestante = quantidade;
    for (const item of itensEstoque) {
      if (quantidadeRestante <= 0) break;

      const quantidadeDeduzida = Math.min(item.quantidade, quantidadeRestante);
      item.quantidade -= quantidadeDeduzida;
      quantidadeRestante -= quantidadeDeduzida;

      await this.save(item);
    }
  }

  // RF0054: Reentrada de itens após troca
  async reentradaEstoque(
    livroId: string,
    quantidade: number,
    custoUnitario: number,
  ): Promise<Estoque> {
    return this.createAndSave({
      livroId: { id: livroId } as Livro,
      quantidade,
      custoUnitario,
      dataEntrada: new Date(),
      notaFiscal: `Reentrada por troca`
    });
  }

  // Consultas específicas
  async getQuantidadeDisponivel(livroId: string): Promise<number> {
    const result = await this.createQueryBuilder("estoque")
      .select("SUM(estoque.quantidade)", "total")
      .where("estoque.livroId = :livroId", { livroId })
      .getRawOne();

    return result?.total || 0;
  }

  async findMovimentacoesPorPeriodo(
    livroId: string,
    periodo: { inicio: Date, fim: Date }
  ): Promise<Estoque[]> {
    return this.find({
      where: {
        livro: { id: livroId },
        dataEntrada: Between(periodo.inicio, periodo.fim)
      },
      order: { dataEntrada: 'DESC' },
      relations: ['fornecedor']
    });
  }

  // RN005x: Atualiza valor de venda quando há diferentes custos
  async getMaiorCustoUnitario(livroId: string): Promise<number> {
    const result = await this.createQueryBuilder("estoque")
      .select("MAX(estoque.custoUnitario)", "maxCusto")
      .where("estoque.livroId = :livroId", { livroId })
      .getRawOne();

    return result?.maxCusto || 0;
  }
}

export { EstoqueRepository };