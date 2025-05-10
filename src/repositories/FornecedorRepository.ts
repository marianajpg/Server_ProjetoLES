import { EntityRepository, Repository } from "typeorm";
import { Fornecedor } from "../entities/Fornecedor";

@EntityRepository(Fornecedor)
class FornecedorRepository extends Repository<Fornecedor> {
  
  // Buscar todos os fornecedores com ou sem relações
  async findAll(relations: string[] = []): Promise<Fornecedor[]> {
    return this.find({ relations });
  }

  // Buscar fornecedor por ID
  async findById(id: string, relations: string[] = []): Promise<Fornecedor | null> {
    return this.findOne({ where: { id }, relations });
  }

  // Buscar fornecedor por CNPJ
  async findByCnpj(cnpj: string): Promise<Fornecedor | null> {
    return this.findOne({ where: { cnpj } });
  }

  // Criar e salvar novo fornecedor
  async createAndSave(fornecedor: Fornecedor): Promise<Fornecedor> {
    return this.save(fornecedor);
  }

  // Atualizar fornecedor existente
  async updateAndSave(fornecedor: Fornecedor): Promise<Fornecedor> {
    return this.save(fornecedor);
  }

  // Buscar fornecedores por filtros opcionais
  async findByFilters(filters: {
    nome?: string;
    cnpj?: string;
    email?: string;
  }): Promise<Fornecedor[]> {
    const query = this.createQueryBuilder("fornecedor");

    if (filters.nome) {
      query.andWhere("fornecedor.nome ILIKE :nome", { nome: `%${filters.nome}%` });
    }

    if (filters.cnpj) {
      query.andWhere("fornecedor.cnpj = :cnpj", { cnpj: filters.cnpj });
    }

    if (filters.email) {
      query.andWhere("fornecedor.email ILIKE :email", { email: `%${filters.email}%` });
    }

    return query.getMany();
  }
}

export { FornecedorRepository };
