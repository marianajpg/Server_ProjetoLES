import { Request, Response } from "express";
import { EnderecoService } from "../services/EnderecoService";
import { ClienteService } from "../services/ClienteService";

export class EnderecoController {
  private enderecoService = new EnderecoService();
  private clienteService = new ClienteService();

  async create(request: Request, response: Response) {
    const { clienteId } = request.params;
    const {
      tipo,
      tipoEndereco,
      logradouro,
      numero,
      complemento,
      bairro,
      cep,
      cidade,
      estado,
      pais,
      observacoes
    } = request.body;

    try {
      // Validação do cliente
      const cliente = await this.clienteService.findById(clienteId);
      if (!cliente) {
        return response.status(404).json({ message: "Cliente não encontrado" });
      }

      // Criação do endereço
      const novoEndereco = await this.enderecoService.createEndereco({
        tipo,
        tipoEndereco,
        logradouro,
        numero,
        complemento,
        bairro,
        cep,
        cidade,
        estado,
        pais: pais || 'Brasil',
        observacoes
      }, cliente);

      // Verificação dos endereços obrigatórios após criação (RN0021, RN0022)
      const validacao = await this.enderecoService.validateClienteEnderecos(clienteId);
      if (!validacao.isValid) {
        console.warn(`Cliente ${clienteId} está sem endereços obrigatórios: ${validacao.missingTypes.join(', ')}`);
      }

      return response.status(201).json(novoEndereco);
    } catch (error: any) {
      return response.status(400).json({ 
        message: error.message || "Erro ao criar endereço" 
      });
    }
  }

  async findAll(request: Request, response: Response) {
    try {
      const enderecos = await this.enderecoService.getAllEnderecos();
      return response.json(enderecos);
    } catch (error: any) {
      return response.status(500).json({ 
        message: error.message || "Erro ao listar endereços" 
      });
    }
  }

  async findById(request: Request, response: Response) {
    const { id } = request.params;
    try {
      const endereco = await this.enderecoService.getEnderecoById(id);
      if (!endereco) {
        return response.status(404).json({ message: "Endereço não encontrado" });
      }
      return response.json(endereco);
    } catch (error: any) {
      return response.status(400).json({ 
        message: error.message || "Erro ao buscar endereço" 
      });
    }
  }

  async update(request: Request, response: Response) {
    const { id, clienteId } = request.params;
    const dadosAtualizados = request.body;

    try {
      // Atualização segura que verifica se o endereço pertence ao cliente (RNF0034)
      const enderecoAtualizado = await this.enderecoService.safeUpdateEndereco(
        id, 
        dadosAtualizados, 
        clienteId
      );
      
      if (!enderecoAtualizado) {
        return response.status(404).json({ message: "Endereço não encontrado" });
      }
      
      return response.json(enderecoAtualizado);
    } catch (error: any) {
      return response.status(400).json({ 
        message: error.message || "Erro ao atualizar endereço" 
      });
    }
  }

  async delete(request: Request, response: Response) {
    const { id, clienteId } = request.params;

    try {
      // Primeiro verifica se o endereço pertence ao cliente
      const endereco = await this.enderecoService.getEnderecoById(id);
      if (!endereco || endereco.cliente.id !== clienteId) {
        return response.status(404).json({ message: "Endereço não encontrado" });
      }

      // Verifica se é um endereço obrigatório (RN0021, RN0022)
      if (endereco.tipoEndereco === 'COBRANCA' || endereco.tipoEndereco === 'ENTREGA') {
        const validacao = await this.enderecoService.validateClienteEnderecos(clienteId);
        if (validacao.missingTypes.includes(endereco.tipoEndereco)) {
          return response.status(400).json({ 
            message: `Não é possível excluir o único endereço de ${endereco.tipoEndereco.toLowerCase()} do cliente`
          });
        }
      }

      await this.enderecoService.deleteEndereco(id);
      return response.status(204).send();
    } catch (error: any) {
      return response.status(400).json({ 
        message: error.message || "Erro ao excluir endereço" 
      });
    }
  }

  async findByCliente(request: Request, response: Response) {
    const { clienteId } = request.params;
    try {
      const cliente = await this.clienteService.findById(clienteId);
      if (!cliente) {
        return response.status(404).json({ message: "Cliente não encontrado" });
      }

      const enderecos = await this.enderecoService.getEnderecosByCliente(clienteId);
      return response.json(enderecos);
    } catch (error: any) {
      return response.status(400).json({ 
        message: error.message || "Erro ao buscar endereços do cliente" 
      });
    }
  }

  async findByTipo(request: Request, response: Response) {
    const { clienteId, tipoEndereco } = request.params;
    try {
      if (!['COBRANCA', 'ENTREGA', 'RESIDENCIAL', 'COMERCIAL', 'OUTRO'].includes(tipoEndereco)) {
        return response.status(400).json({ message: "Tipo de endereço inválido" });
      }

      const enderecos = await this.enderecoService.getEnderecosByTipo(clienteId, tipoEndereco);
      return response.json(enderecos);
    } catch (error: any) {
      return response.status(400).json({ 
        message: error.message || "Erro ao buscar endereços por tipo" 
      });
    }
  }

  async getEnderecoPadraoEntrega(request: Request, response: Response) {
    const { clienteId } = request.params;
    try {
      const endereco = await this.enderecoService.getEnderecoPadraoEntrega(clienteId);
      if (!endereco) {
        return response.status(404).json({ 
          message: "Endereço de entrega padrão não encontrado" 
        });
      }
      return response.json(endereco);
    } catch (error: any) {
      return response.status(400).json({ 
        message: error.message || "Erro ao buscar endereço padrão de entrega" 
      });
    }
  }

  async getEnderecoPadraoCobranca(request: Request, response: Response) {
    const { clienteId } = request.params;
    try {
      const endereco = await this.enderecoService.getEnderecoPadraoCobranca(clienteId);
      if (!endereco) {
        return response.status(404).json({ 
          message: "Endereço de cobrança padrão não encontrado" 
        });
      }
      return response.json(endereco);
    } catch (error: any) {
      return response.status(400).json({ 
        message: error.message || "Erro ao buscar endereço padrão de cobrança" 
      });
    }
  }

  async validateEnderecosCliente(request: Request, response: Response) {
    const { clienteId } = request.params;
    try {
      const validacao = await this.enderecoService.validateClienteEnderecos(clienteId);
      return response.json(validacao);
    } catch (error: any) {
      return response.status(400).json({ 
        message: error.message || "Erro ao validar endereços do cliente" 
      });
    }
  }

  async createInitialEnderecos(request: Request, response: Response) {
    const { clienteId } = request.params;
    const { enderecoCobranca, enderecoEntrega } = request.body;

    try {
      const cliente = await this.clienteService.findById(clienteId);
      if (!cliente) {
        return response.status(404).json({ message: "Cliente não encontrado" });
      }

      // Validação dos dados obrigatórios (RN0023)
      if (!enderecoCobranca || !enderecoCobranca.logradouro || !enderecoCobranca.numero || 
          !enderecoCobranca.bairro || !enderecoCobranca.cep || !enderecoCobranca.cidade || 
          !enderecoCobranca.estado) {
        return response.status(400).json({ 
          message: "Dados incompletos para o endereço de cobrança" 
        });
      }

      const enderecos = await this.enderecoService.createInitialEnderecos(
        cliente, 
        enderecoCobranca, 
        enderecoEntrega
      );

      return response.status(201).json(enderecos);
    } catch (error: any) {
      return response.status(400).json({ 
        message: error.message || "Erro ao criar endereços iniciais" 
      });
    }
  }
}