// controllers/EditoraController.ts
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Editora } from "../entities/Editora";
import { Livro } from "../entities/Livros";

export class EditoraController {
  // Consulta todas as editoras (simples)
  async findAll(request: Request, response: Response) {
    try {
      const editoraRepository = getRepository(Editora);
      const editoras = await editoraRepository.find({
        select: ["id", "nome", "site"], // Apenas campos necessários
        order: { nome: "ASC" }
      });
      return response.json(editoras);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao listar editoras" });
    }
  }

  // Consulta editora por ID (com livros associados)
  async findById(request: Request, response: Response) {
    try {
      const editoraRepository = getRepository(Editora);
      const editora = await editoraRepository.findOne(request.params.id, {
        relations: ["livros"] // Carrega os livros associados
      });
      
      if (!editora) {
        return response.status(404).json({ message: "Editora não encontrada" });
      }
      
      return response.json(editora);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao buscar editora" });
    }
  }

  // Consulta editora de um livro específico
  async buscarPorLivro(request: Request, response: Response) {
    try {
      const livroRepository = getRepository(Livro);
      const livro = await livroRepository.findOne(request.params.livroId, {
        relations: ["editora"]
      });

      if (!livro || !livro.editora) {
        return response.status(404).json({ message: "Editora não encontrada para este livro" });
      }

      return response.json(livro.editora);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao buscar editora do livro" });
    }
  }
}