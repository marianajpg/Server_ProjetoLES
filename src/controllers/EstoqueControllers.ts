import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Estoque } from "../entities/Estoque";
import { Livro } from "../entities/Livros";
import { Fornecedor } from "../entities/Fornecedor";

export class EstoqueController {
  // Consulta todo o estoque (simples)
  async findAll(request: Request, response: Response) {
    try {
      const estoqueRepository = getRepository(Estoque);
      const estoque = await estoqueRepository.find({
        select: ["id", "quantidade", "custoUnitario", "dataEntrada", "notaFiscal"],
        order: { dataEntrada: "DESC" }
      });
      return response.json(estoque);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao listar estoque" });
    }
  }

  // Consulta estoque por ID
  async findById(request: Request, response: Response) {
    try {
      const estoqueRepository = getRepository(Estoque);
      const itemEstoque = await estoqueRepository.findOne(request.params.id, {
        relations: ["livro", "fornecedor"]
      });

      if (!itemEstoque) {
        return response.status(404).json({ message: "Item de estoque não encontrado" });
      }

      return response.json(itemEstoque);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao buscar item de estoque" });
    }
  }

  async create(request: Request, response: Response) {
    const {
      quantidade,
      custoUnitario,
      dataEntrada,
      notaFiscal,
      livroId,
      fornecedorId
    } = request.body;
  
    try {
      const livroRepository = getRepository(Livro);
      const fornecedorRepository = getRepository(Fornecedor);
      const estoqueRepository = getRepository(Estoque);
  
      const livro = await livroRepository.findOne({ id: livroId });
      if (!livro) {
        return response.status(404).json({ message: "Livro não encontrado." });
      }
  
      const fornecedor = await fornecedorRepository.findOne({ id: fornecedorId });
      if (!fornecedor) {
        return response.status(404).json({ message: "Fornecedor não encontrado." });
      }
  
      if (quantidade <= 0) {
        return response.status(400).json({ message: "Quantidade deve ser maior que zero." });
      }
  
      const novoEstoque = estoqueRepository.create({
        quantidade,
        custoUnitario,
        dataEntrada: new Date(dataEntrada),
        notaFiscal,
        livroId,
        fornecedor
      });
  
      const estoqueSalvo = await estoqueRepository.save(novoEstoque);
  
      response.status(201).json(estoqueSalvo);
    } catch (error: any) {
      response.status(500).json({
        message: "Erro ao cadastrar estoque.",
        error: error.message
      });
    }
  }
  

  // Consulta itens de estoque de um livro específico
  async buscarPorLivro(request: Request, response: Response) {
    try {
      const livroRepository = getRepository(Livro);
      const livro = await livroRepository.findOne(request.params.livroId, {
        relations: ["estoque"]
      });

      if (!livro || !livro.estoque.length) {
        return response.status(404).json({ message: "Nenhum item de estoque encontrado para este livro" });
      }

      return response.json(livro.estoque);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao buscar estoque do livro" });
    }
  }
}
