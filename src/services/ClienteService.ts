import { ClienteRepository } from "../repositories/ClienteRepository";
import { Cliente } from "../entities/Cliente";
import { Endereco } from "../entities/Endereco";
import { Venda } from "../entities/Venda";
import { getCustomRepository } from "typeorm";

export class ClienteService {
  private clienteRepository: ClienteRepository;

  constructor() {
    this.clienteRepository = getCustomRepository(ClienteRepository);
  }

  async findAll(relations: string[] = []): Promise<Cliente[]> {
    return this.clienteRepository.findAll(relations);
  }

  async findById(id: string, relations: string[] = []): Promise<Cliente> {
    const cliente = await this.clienteRepository.findById(id, relations);
    if (!cliente) throw new Error("Cliente não encontrado");
    return cliente;
  }

  async createAndSave(clienteData: Cliente): Promise<Cliente> {
    // Valida se possui endereço de cobrança e entrega
  /*   const possuiEnderecoEntrega = clienteData.enderecos?.some(e => e.tipo === 'ENTREGA');
    const possuiEnderecoCobranca = clienteData.enderecos?.some(e => e.tipo === 'COBRANCA');

    if (!possuiEnderecoEntrega) {
      throw new Error("O cliente precisa ter pelo menos um endereço de entrega");
    }

    if (!possuiEnderecoCobranca) {
      throw new Error("O cliente precisa ter pelo menos um endereço de cobrança");
    } */

    // Ativa cliente por padrão
    clienteData.ativo = true;
    clienteData.created_at = new Date(); //precisa???
    clienteData.ranking = 0;

    return this.clienteRepository.createAndSave(clienteData);
  }

  async update(id: string, dados: Partial<Cliente>): Promise<Cliente> {
    const cliente = await this.findById(id);
    Object.assign(cliente, dados);
    return this.clienteRepository.updateAndSave(cliente);
  }

  async inativar(id: string): Promise<void> {
    const cliente = await this.findById(id);
    if (!cliente.ativo) {
      throw new Error("O cliente já está inativo");
    }
    await this.clienteRepository.inativarCliente(id);
  }

  async findByFilters(filtros: {
    nome?: string;
    email?: string;
    ativo?: boolean;
    rankingMin?: number;
    rankingMax?: number;
  }): Promise<Cliente[]> {
    return this.clienteRepository.findByFilters(filtros);
  }

  async listarTransacoes(clienteId: string): Promise<Venda[]> {
    await this.findById(clienteId); // Garante que o cliente existe
    return this.clienteRepository.findTransacoesByClienteId(clienteId);
  }

  async verificarEnderecosObrigatorios(clienteId: string): Promise<void> {
    const possuiEntrega = await this.clienteRepository.hasEnderecoEntrega(clienteId);
    const possuiCobranca = await this.clienteRepository.hasEnderecoCobranca(clienteId);

    if (!possuiEntrega) {
      throw new Error("O cliente deve possuir pelo menos um endereço de entrega.");
    }

    if (!possuiCobranca) {
      throw new Error("O cliente deve possuir pelo menos um endereço de cobrança.");
    }
  }
}
