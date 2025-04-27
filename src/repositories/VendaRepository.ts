import { EntityRepository, Repository, Between, LessThanOrEqual, MoreThanOrEqual, In, getRepository } from "typeorm";

import { Venda } from "../entities/Venda";
import { StatusVenda } from "../entities/StatusVenda";
import { Livro } from "../entities/Livros";

@EntityRepository(Venda)
class VendaRepository extends Repository<Venda> {
  // Métodos básicos de CRUD
  async findAll(relations: string[] = []): Promise<Venda[]> {
    return this.find({ relations });
  }

  async findById(id: string, relations: string[] = []): Promise<Venda | null> {
    return this.findOne({ where: { id }, relations });
  }

  async createAndSave(venda:  Partial<Venda>): Promise<Venda> {
    return this.save(venda);
  }

  // Consultas com filtros
  async findByFilters(filters: {
    clienteId?: string,
    status?: StatusVenda[],
    dataInicio?: Date,
    dataFim?: Date,
    livroId?: string,
    valorMin?: number,
    valorMax?: number
  }): Promise<Venda[]> {
    const where: any = {};
    
    if (filters.clienteId) where.cliente = filters.clienteId;
    if (filters.status) where.status = In(filters.status);
    if (filters.dataInicio && filters.dataFim) {
      where.dataCriacao = Between(filters.dataInicio, filters.dataFim);
    } else if (filters.dataInicio) {
      where.dataCriacao = MoreThanOrEqual(filters.dataInicio);
    } else if (filters.dataFim) {
      where.dataCriacao = LessThanOrEqual(filters.dataFim);
    }
    if (filters.valorMin && filters.valorMax) {
      where.valorTotal = Between(filters.valorMin, filters.valorMax);
    }

    const query = this.createQueryBuilder("venda")
      .leftJoinAndSelect("venda.cliente", "cliente")
      .leftJoinAndSelect("venda.itens", "itens")
      .leftJoinAndSelect("itens.livro", "livro")
      .leftJoinAndSelect("venda.enderecoEntrega", "enderecoEntrega")
      .leftJoinAndSelect("venda.pagamentos", "pagamentos")
      .where(where);

    if (filters.livroId) {
      query.andWhere("itens.livroId = :livroId", { livroId: filters.livroId });
    }

    return await query.getMany();
  }


  // Métodos auxiliares
  async getLivrosComEstoque(livroIds: string[]): Promise<Livro[]> {
    return getRepository(Livro).find({
      where: { id: In(livroIds) },
      relations: ['estoque']
    });
  }

  async obterVendasPorLivro(livroId: string, periodo: { inicio: Date, fim: Date }) {
    const vendasComLivro = await this.createQueryBuilder("venda")
      .leftJoinAndSelect("venda.itens", "item")
      .leftJoinAndSelect("item.livro", "livro")
      .where("livro.id = :livroId", { livroId })
      .andWhere("venda.dataVenda BETWEEN :inicio AND :fim", { 
        inicio: periodo.inicio, 
        fim: periodo.fim 
      })
      .andWhere("venda.status IN (:...statusValidos)", {
        statusValidos: ['APROVADA', 'ENTREGUE'] // considera apenas vendas finalizadas
      })
      .select([
        "item.quantidade",
        "item.valorUnitario",
        "venda.id"
      ])
      .getMany();

    // Mapeia e retorna apenas os itens relevantes
    const itens = vendasComLivro
  .map(venda => 
    venda.itens
      .filter(item => item.livro.id === livroId)
      .map(item => ({
        quantidade: item.quantidade,
        valorUnitario: item.precoUnitario
      }))
  )
  .reduce((acc, curr) => acc.concat(curr), []);


    return itens;
  }
}

export { VendaRepository };





