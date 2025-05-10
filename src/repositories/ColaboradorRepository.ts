import { EntityRepository, Repository, Like } from "typeorm";
import { Colaborador } from "../entities/Colaborador";

@EntityRepository(Colaborador)
class ColaboradorRepository extends Repository<Colaborador> {
  // Lista todos os colaboradores
  async findAll(): Promise<Colaborador[]> {
    return this.find();
  }

  // Busca por ID
  async findById(id: string): Promise<Colaborador | null> {
    return this.findOne({ where: { id } });
  }

  // Criação de novo colaborador
  async createAndSave(colaborador: Colaborador): Promise<Colaborador> {
    return this.save(colaborador);
  }

  // Atualização de colaborador existente
  async updateAndSave(colaborador: Colaborador): Promise<Colaborador> {
    return this.save(colaborador);
  }

  // Busca por filtros opcionais
  async findByFilters(filters: {
    nome?: string;
    email?: string;
  }): Promise<Colaborador[]> {
    const query = this.createQueryBuilder("colaborador");

    if (filters.nome) {
      query.andWhere("colaborador.nome ILIKE :nome", { nome: `%${filters.nome}%` });
    }

    if (filters.email) {
      query.andWhere("colaborador.email ILIKE :email", { email: `%${filters.email}%` });
    }

    return query.getMany();
  }
}

export { ColaboradorRepository };
