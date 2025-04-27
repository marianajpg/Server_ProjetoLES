import {EntityRepository,Repository,In,getRepository,Like} from "typeorm";
import { Cliente } from "../entities/Cliente";
import { Endereco } from "../entities/Endereco";
import { Venda } from "../entities/Venda";

@EntityRepository(Cliente)
class ClienteRepository extends Repository<Cliente> {
  // Métodos básicos de CRUD
  async findAll(relations: string[] = []): Promise<Cliente[]> {
    return this.find({ relations });
  }

  async findById(id: string, relations: string[] = []): Promise<Cliente | null> {
    return this.findOne({ where: { id }, relations });
  }

  async createAndSave(cliente: Cliente): Promise<Cliente> {
    return this.save(cliente);
  }

  async updateAndSave(cliente: Cliente): Promise<Cliente> {
    return this.save(cliente);
  }

  async inativarCliente(id: string): Promise<void> {
    await this.update(id, { ativo: false });
  }

  // Consulta com filtros definidos pelo usuário (nome, email, ativo, ranking, etc.)
  async findByFilters(filters: {
    nome?: string;
    email?: string;
    ativo?: boolean;
    rankingMin?: number;
    rankingMax?: number;
  }): Promise<Cliente[]> {
    const query = this.createQueryBuilder("cliente");

    if (filters.nome) {
      query.andWhere("cliente.nome ILIKE :nome", { nome: `%${filters.nome}%` });
    }

    if (filters.email) {
      query.andWhere("cliente.email ILIKE :email", { email: `%${filters.email}%` });
    }

    if (filters.ativo !== undefined) {
      query.andWhere("cliente.ativo = :ativo", { ativo: filters.ativo });
    }

    if (filters.rankingMin !== undefined) {
      query.andWhere("cliente.ranking >= :rankingMin", { rankingMin: filters.rankingMin });
    }

    if (filters.rankingMax !== undefined) {
      query.andWhere("cliente.ranking <= :rankingMax", { rankingMax: filters.rankingMax });
    }

    return query.getMany();
  }

  // Transações realizadas pelo cliente
  async findTransacoesByClienteId(clienteId: string): Promise<Venda[]> {
    return getRepository(Venda).find({
      where: { cliente: { id: clienteId } },
      relations: ['itens', 'itens.livro', 'pagamentos', 'enderecoEntrega']
    });
  }

  // Valida se cliente tem pelo menos um endereço de cobrança
  async hasEnderecoCobranca(clienteId: string): Promise<boolean> {
    const result = await getRepository(Endereco).findOne({
      where: {
        cliente: { id: clienteId },
        tipo: 'COBRANCA' // assumindo que existe esse campo
      }
    });
    return !!result;
  }

  // Valida se cliente tem pelo menos um endereço de entrega
  async hasEnderecoEntrega(clienteId: string): Promise<boolean> {
    const result = await getRepository(Endereco).findOne({
      where: {
        cliente: { id: clienteId },
        tipo: 'ENTREGA'
      }
    });
    return !!result;
  }
}

export { ClienteRepository };
