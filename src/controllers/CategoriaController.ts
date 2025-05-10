// controllers/CategoriaController.ts
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Categoria } from "../entities/Categoria";
import { Livro } from "../entities/Livros";

export class CategoriaController {
  // Consulta todas as categorias (simples)
  async findAll(request: Request, response: Response) {
    try {
      const categoriaRepository = getRepository(Categoria);
      const categorias = await categoriaRepository.find({
        select: ["id", "nome", "descricao"], // Apenas campos necessários
        order: { nome: "ASC" }
      });
      return response.json(categorias);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao listar categorias" });
    }
  }

  // Consulta categoria por ID (com livros associados)
  async findById(request: Request, response: Response) {
    try {
      const categoriaRepository = getRepository(Categoria);
      const categoria = await categoriaRepository.findOne(request.params.id, {
        relations: ["livros"] // Carrega os livros associados
      });

      if (!categoria) {
        return response.status(404).json({ message: "Categoria não encontrada" });
      }

      return response.json(categoria);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao buscar categoria" });
    }
  }

  // Consulta categorias de um livro específico
  async buscarPorLivro(request: Request, response: Response) {
    try {
      const livroRepository = getRepository(Livro);
      const livro = await livroRepository.findOne(request.params.livroId, {
        relations: ["categorias"]
      });

      if (!livro || !livro.categorias || livro.categorias.length === 0) {
        return response.status(404).json({ message: "Nenhuma categoria encontrada para este livro" });
      }

      return response.json(livro.categorias);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao buscar categorias do livro" });
    }
  }
}
