import { getCustomRepository } from "typeorm";
import { EnderecoRepository } from "../repositories/EnderecoRepository";
import { Endereco } from "../entities/Endereco";
import { Cliente } from "../entities/Cliente";

class EnderecoService {
  private enderecoRepository: EnderecoRepository;

  constructor() {
    this.enderecoRepository = getCustomRepository(EnderecoRepository);
  }

  // Métodos básicos
  async getAllEnderecos(): Promise<Endereco[]> {
    return this.enderecoRepository.findAll();
  }

  async getEnderecoById(id: string): Promise<Endereco | null> {
    return this.enderecoRepository.findById(id, ['cliente']);
  }

  async createEndereco(enderecoData: Partial<Endereco>, cliente: Cliente): Promise<Endereco> {
    const endereco = this.enderecoRepository.create({
      ...enderecoData,
      cliente
    });
    
    return this.enderecoRepository.save(endereco);
  }

  async updateEndereco(id: string, enderecoData: Partial<Endereco>): Promise<Endereco | null> {
    return this.enderecoRepository.updateEndereco(id, enderecoData);
  }

  async deleteEndereco(id: string): Promise<void> {
    return this.enderecoRepository.deleteEndereco(id);
  }

  // Métodos específicos
  async getEnderecosByCliente(clienteId: string): Promise<Endereco[]> {
    return this.enderecoRepository.findByCliente(clienteId);
  }

  async getEnderecosByTipo(clienteId: string, tipoEndereco: string): Promise<Endereco[]> {
    return this.enderecoRepository.findByTipo(clienteId, tipoEndereco);
  }

  async getEnderecoPadraoEntrega(clienteId: string): Promise<Endereco | null> {
    return this.enderecoRepository.findEnderecoPadraoEntrega(clienteId);
  }

  async getEnderecoPadraoCobranca(clienteId: string): Promise<Endereco | null> {
    return this.enderecoRepository.findEnderecoPadraoCobranca(clienteId);
  }

  // Validação de regras de negócio
  async validateClienteEnderecos(clienteId: string): Promise<{ isValid: boolean; missingTypes: string[] }> {
    const validation = await this.enderecoRepository.validateEnderecosCliente(clienteId);
    const missingTypes = [];
    
    if (!validation.hasCobranca) missingTypes.push('COBRANCA');
    if (!validation.hasEntrega) missingTypes.push('ENTREGA');

    return {
      isValid: missingTypes.length === 0,
      missingTypes
    };
  }

  // Método para cadastro inicial de endereços (RN0021, RN0022)
  async createInitialEnderecos(cliente: Cliente, enderecoCobranca: Partial<Endereco>, enderecoEntrega?: Partial<Endereco>): Promise<{ cobranca: Endereco; entrega: Endereco }> {
    // Cria endereço de cobrança (obrigatório)
    const cobranca = await this.createEndereco({
      ...enderecoCobranca,
      tipoEndereco: 'COBRANCA'
    }, cliente);

    // Cria endereço de entrega (usa cobrança se não fornecido)
    const entrega = await this.createEndereco({
      ...(enderecoEntrega || enderecoCobranca),
      tipoEndereco: 'ENTREGA'
    }, cliente);

    return { cobranca, entrega };
  }

  // Método para atualização segura de endereço (RNF0034)
  async safeUpdateEndereco(id: string, enderecoData: Partial<Endereco>, clienteId: string): Promise<Endereco | null> {
    const endereco = await this.enderecoRepository.findOne({ 
      where: { id, cliente: clienteId } 
    });

    if (!endereco) {
      throw new Error('Endereço não encontrado ou não pertence ao cliente');
    }

    return this.updateEndereco(id, enderecoData);
  }
}

export { EnderecoService };