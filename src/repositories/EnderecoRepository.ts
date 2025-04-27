import { EntityRepository, Repository, getRepository } from "typeorm";
import { Endereco } from "../entities/Endereco";
import { Cliente } from "../entities/Cliente";

@EntityRepository(Endereco)
class EnderecoRepository extends Repository<Endereco> {
  // Métodos básicos de CRUD
  async findAll(relations: string[] = []): Promise<Endereco[]> {
    return this.find({ relations });
  }

  async findById(id: string, relations: string[] = []): Promise<Endereco | null> {
    return this.findOne({ where: { id }, relations });
  }

  async createAndSave(endereco: Endereco): Promise<Endereco> {
    return this.save(endereco);
  }

  async updateEndereco(id: string, enderecoData: Partial<Endereco>): Promise<Endereco | null> {
    await this.update(id, enderecoData);
    return this.findById(id);
  }

  async deleteEndereco(id: string): Promise<void> {
    await this.delete(id);
  }

  // Consultas específicas para endereços
  async findByCliente(clienteId: string): Promise<Endereco[]> {
    return this.find({ 
      where: { cliente: clienteId },
      relations: ['cliente']
    });
  }

  async findByTipo(clienteId: string, tipoEndereco: string): Promise<Endereco[]> {
    return this.find({ 
      where: { 
        cliente: clienteId,
        tipoEndereco 
      },
      relations: ['cliente']
    });
  }

  async findEnderecoPadraoEntrega(clienteId: string): Promise<Endereco | null> {
    const endereco = await this.createQueryBuilder("endereco")
      .where("endereco.clienteId = :clienteId", { clienteId })
      .andWhere("endereco.tipoEndereco = :tipo", { tipo: 'ENTREGA' })
      .orderBy("endereco.created_at", "DESC")
      .getOne();
  
    return endereco;
  }
  
  async findEnderecoPadraoCobranca(clienteId: string): Promise<Endereco | null> {
    const endereco = await this.createQueryBuilder("endereco")
      .where("endereco.clienteId = :clienteId", { clienteId })
      .andWhere("endereco.tipoEndereco = :tipo", { tipo: 'COBRANCA' })
      .orderBy("endereco.created_at", "DESC")
      .getOne();
  
    return endereco;
  }
  // Método para validar se um cliente tem pelo menos um endereço de cada tipo (RN0021, RN0022)
  async validateEnderecosCliente(clienteId: string): Promise<{ hasCobranca: boolean; hasEntrega: boolean }> {
    const cobrancaCount = await this.count({ 
      where: { 
        cliente: clienteId,
        tipoEndereco: 'COBRANCA' 
      } 
    });
    
    const entregaCount = await this.count({ 
      where: { 
        cliente: clienteId,
        tipoEndereco: 'ENTREGA' 
      } 
    });

    return {
      hasCobranca: cobrancaCount > 0,
      hasEntrega: entregaCount > 0
    };
  }
}

export { EnderecoRepository };