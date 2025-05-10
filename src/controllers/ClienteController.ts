import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { ClienteService } from "../services/ClienteService";
import { Cliente } from "../entities/Cliente";
import { Endereco } from "../entities/Endereco";
import { ClienteRepository } from "../repositories/ClienteRepository";
import { hash } from "bcryptjs";

export class ClienteController {
  private clienteService = new ClienteService();
  constructor() {
    this.clienteService = new ClienteService(); // instancia o service aqui
  }

  async create(request: Request, response: Response) {
    const {
      nome,
      email,
      senha,
      cpf,
      telefone,
      dataNascimento,
      genero,
      enderecos,
      cartoes
    } = request.body;
  
    try {
      // Criptografar a senha antes de salvar no banco de dados
      const senhaCriptografada = await hash(senha, 10); // O "10" é o custo do hash
  
      const novoCliente = new Cliente();
      novoCliente.nome = nome;
      novoCliente.email = email;
      novoCliente.senha = senhaCriptografada; // Agora, a senha criptografada será salva no banco
      novoCliente.cpf = cpf;
      novoCliente.telefone = telefone;
      novoCliente.dataNascimento = new Date(dataNascimento);
      novoCliente.genero = genero;
  
      novoCliente.enderecos = enderecos.map((enderecoData: any) => {
        const endereco = new Endereco();
        Object.assign(endereco, enderecoData);
        return endereco;
      });
  
      novoCliente.cartoes = cartoes || [];
  
      const clienteCriado = await this.clienteService.createAndSave(novoCliente);
  
      response.status(201).json(clienteCriado);
    } catch (error: any) {
      response.status(400).json({ message: error.message || "Erro ao criar cliente" });
    }
  }
  

  async findAll(request: Request, response: Response) {
    try {
      const clientes = await this.clienteService.findAll(["enderecos", "cartoes", "vendas", "carrinhos"]);
      response.json(clientes);
    } catch (error: any) {
      response.status(500).json({ message: error.message || "Erro ao listar clientes" });
    }
  }

  async findById(request: Request, response: Response) {
    const { id } = request.params;
    try {
      const cliente = await this.clienteService.findById(id, ["enderecos", "cartoes", "vendas", "carrinhos"]);
       response.json(cliente);
    } catch (error: any) {
       response.status(404).json({ message: error.message || "Cliente não encontrado" });
    }
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    const dadosAtualizados = { ...request.body };
  
    try {
      // Criptografar a senha, se ela estiver presente
      if (dadosAtualizados.senha) {
        dadosAtualizados.senha = await hash(dadosAtualizados.senha, 10);
      }
  
      const clienteAtualizado = await this.clienteService.update(id, dadosAtualizados);
      response.json(clienteAtualizado);
    } catch (error: any) {
      response.status(400).json({ message: error.message || "Erro ao atualizar cliente" });
    }
  }
  

  async delete(request: Request, response: Response) {
    const { id } = request.params;

    try {
      await this.clienteService.inativar(id);
       response.status(204).send();
    } catch (error: any) {
       response.status(400).json({ message: error.message || "Erro ao inativar cliente" });
    }
  }

  async filter(request: Request, response: Response) {
    const filtros = request.query;
    try {
      const clientes = await this.clienteService.findByFilters({
        nome: filtros.nome as string,
        email: filtros.email as string,
        ativo: filtros.ativo === "true",
        rankingMin: filtros.rankingMin ? Number(filtros.rankingMin) : undefined,
        rankingMax: filtros.rankingMax ? Number(filtros.rankingMax) : undefined
      });
       response.json(clientes);
    } catch (error: any) {
       response.status(400).json({ message: error.message || "Erro ao filtrar clientes" });
    }
  }

  async listarTransacoes(request: Request, response: Response) {
    const { id } = request.params;
    try {
      const transacoes = await this.clienteService.listarTransacoes(id);
       response.json(transacoes);
    } catch (error: any) {
       response.status(400).json({ message: error.message || "Erro ao buscar transações do cliente" });
    }
  }

  async verificarEnderecosObrigatorios(request: Request, response: Response) {
    const { id } = request.params;
    try {
      await this.clienteService.verificarEnderecosObrigatorios(id);
       response.status(200).json({ message: "Cliente possui os endereços obrigatórios." });
    } catch (error: any) {
       response.status(400).json({ message: error.message });
    }
  }
}
