import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { ImagemLivro } from "../entities/ImagemLivro";
import { Livro } from "../entities/Livros";

export class ImagemLivroController {
  // Consulta todas as imagens (simples)
  async findAll(request: Request, response: Response) {
    try {
      const imagemLivroRepository = getRepository(ImagemLivro);
      const imagens = await imagemLivroRepository.find({
        select: ["id", "url", "legenda"],
        order: { created_at: "DESC" }
      });
      return response.json(imagens);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao listar imagens de livros" });
    }
  }

  // Consulta imagem por ID
  async findById(request: Request, response: Response) {
    try {
      const imagemLivroRepository = getRepository(ImagemLivro);
      const imagem = await imagemLivroRepository.findOne(request.params.id, {
        relations: ["livro"]
      });

      if (!imagem) {
        return response.status(404).json({ message: "Imagem não encontrada" });
      }

      return response.json(imagem);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao buscar imagem de livro" });
    }
  }

  // Consulta imagens de um livro específico
  async buscarPorLivro(request: Request, response: Response) {
    try {
      const livroRepository = getRepository(Livro);
      const livro = await livroRepository.findOne(request.params.livroId, {
        relations: ["imagens"]
      });

      if (!livro || !livro.imagens.length) {
        return response.status(404).json({ message: "Nenhuma imagem encontrada para este livro" });
      }

      return response.json(livro.imagens);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao buscar imagens do livro" });
    }
  }
}
