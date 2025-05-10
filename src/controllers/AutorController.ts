// controllers/AutorController.ts
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Autor } from "../entities/Autor";
import { Livro } from "../entities/Livros";

export class AutorController {

  async findAll(request: Request, response: Response) {
    try {
      const autorRepository = getRepository(Autor);
      const autores = await autorRepository.find({
        select: ["id", "nome", "biografia"], // Apenas os campos necessários
        order: { nome: "ASC" }
      });
      return response.json(autores);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao listar autores" });
    }
  }


  async findById(request: Request, response: Response) {
    try {
      const autorRepository = getRepository(Autor);
      const autor = await autorRepository.findOne(request.params.id, {
        relations: ["livros"] 
      });

      if (!autor) {
        return response.status(404).json({ message: "Autor não encontrado" });
      }

      return response.json(autor);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao buscar autor" });
    }
  }

  async buscarPorLivro(request: Request, response: Response) {
    try {
      const livroRepository = getRepository(Livro);
      const livro = await livroRepository.findOne(request.params.livroId, {
        relations: ["autor"]
      });

      if (!livro || !livro.autor) {
        return response.status(404).json({ message: "Autor não encontrado para este livro" });
      }

      return response.json(livro.autor);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao buscar autor do livro" });
    }
  }
}
