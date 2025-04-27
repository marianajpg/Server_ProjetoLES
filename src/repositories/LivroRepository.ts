import { EntityRepository, Repository, In, Like, Between, MoreThanOrEqual } from "typeorm";
import { Livro } from "../entities/Livros";
import { GrupoPrecificacao } from "../entities/GrupoPrecificacao";
import { Categoria } from "../entities/Categoria";
import {CategoriaInativacao } from "../entities/Livros"

@EntityRepository(Livro)
class LivroRepository extends Repository<Livro> {
  // Métodos básicos de CRUD
  async findAll(relations: string[] = []): Promise<Livro[]> {
    return this.find({ 
      relations,
      where: { ativo: true } // Filtro padrão para só trazer ativos
    });
  }

  async findById(id: string, relations: string[] = []): Promise<Livro | null> {
    return this.findOne({ 
      where: { id },
      relations 
    });
  }

  async createAndSave(livro: Partial<Livro>): Promise<Livro> {
    const novoLivro = this.create(livro);
    return this.save(novoLivro);
  }

  // Consultas com filtros (RF0015)
  async findByFilters(filters: {
    titulo?: string,
    autorId?: string,
    editoraId?: string,
    categoriaIds?: string[],
    grupoPrecificacaoId?: string,
    valorMin?: number,
    valorMax?: number,
    ativo?: boolean,
    comEstoque?: boolean,
    termoBusca?: string
  }): Promise<Livro[]> {
    const query = this.createQueryBuilder("livro")
      .leftJoinAndSelect("livro.autor", "autor")
      .leftJoinAndSelect("livro.editora", "editora")
      .leftJoinAndSelect("livro.categorias", "categorias")
      .leftJoinAndSelect("livro.grupoPrecificacao", "grupoPrecificacao")
      .leftJoinAndSelect("livro.estoque", "estoque");

    if (filters.titulo) {
      query.andWhere("livro.titulo LIKE :titulo", { titulo: `%${filters.titulo}%` });
    }

    if (filters.termoBusca) {
      query.andWhere("(livro.titulo LIKE :termo OR livro.sinopse LIKE :termo OR autor.nome LIKE :termo)", {
        termo: `%${filters.termoBusca}%`
      });
    }

    if (filters.autorId) {
      query.andWhere("livro.autorId = :autorId", { autorId: filters.autorId });
    }

    if (filters.editoraId) {
      query.andWhere("livro.editoraId = :editoraId", { editoraId: filters.editoraId });
    }

    if (filters.categoriaIds && filters.categoriaIds.length > 0) {
      query.andWhere("categorias.id IN (:...categoriaIds)", { categoriaIds: filters.categoriaIds });
    }

    if (filters.grupoPrecificacaoId) {
      query.andWhere("livro.grupoPrecificacaoId = :grupoPrecificacaoId", { 
        grupoPrecificacaoId: filters.grupoPrecificacaoId 
      });
    }

    if (filters.valorMin && filters.valorMax) {
      query.andWhere("livro.valorVenda BETWEEN :valorMin AND :valorMax", { 
        valorMin: filters.valorMin, 
        valorMax: filters.valorMax 
      });
    }

    if (typeof filters.ativo !== 'undefined') {
      query.andWhere("livro.ativo = :ativo", { ativo: filters.ativo });
    }

    if (filters.comEstoque) {
      query.andWhere("estoque.quantidade > 0");
    }

    return query.getMany();
  }

  // RF0012: Inativar livros
  async inativarLivro(id: string, justificativa: string, categoria: string): Promise<Livro> {
    await this.update(id, {
      ativo: false,
      dataInativacao: new Date(),
      justificativaInativacao: justificativa,
      categoriaInativacao: categoria as CategoriaInativacao
    });
    return this.findOneOrFail(id);
  }

  // RF0016: Ativar livros
  async ativarLivro(id: string, justificativa: string, categoria: string): Promise<Livro> {
    await this.update(id, {
      ativo: true,
      dataInativacao: null,
      justificativaInativacao: null,
      categoriaInativacao: null
    });
    return this.findOneOrFail(id);
  }

  // RF0013: Encontrar livros para inativação automática
  async findLivrosParaInativacaoAutomatica(): Promise<Livro[]> {
    // Livros sem estoque
    const semEstoque = await this.createQueryBuilder("livro")
      .leftJoinAndSelect("livro.estoque", "estoque")
      .where("estoque.quantidade <= 0")
      .andWhere("livro.ativo = true")
      .getMany();

    // Livros com baixo desempenho (exemplo: menos de 5 vendas nos últimos 3 meses)
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

    const comBaixoDesempenho = await this.createQueryBuilder("livro")
      .leftJoinAndSelect("livro.itensVenda", "itensVenda")
      .leftJoinAndSelect("itensVenda.venda", "venda")
      .where("venda.data >= :data", { data: tresMesesAtras })
      .andWhere("livro.ativo = true")
      .groupBy("livro.id")
      .having("SUM(itensVenda.quantidade) < 5")
      .getMany();

    // Remove duplicados e retorna
    const ids = new Set([...semEstoque, ...comBaixoDesempenho].map(l => l.id));
    return this.findByIds(Array.from(ids));
  }

  // Métodos auxiliares
  async getEstoqueTotal(livroId: string): Promise<number> {
    const result = await this.createQueryBuilder("livro")
      .leftJoin("livro.estoque", "estoque")
      .select("SUM(estoque.quantidade)", "total")
      .where("livro.id = :id", { id: livroId })
      .getRawOne();

    return result?.total || 0;
  }
}

export { LivroRepository };