// controllers/GrupoPrecificacaoController.ts
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { GrupoPrecificacao } from "../entities/GrupoPrecificacao";
import { Livro } from "../entities/Livros";

export class GrupoPrecificacaoController {
  async findAll(request: Request, response: Response) {
    try {
      const grupoPrecificacaoRepository = getRepository(GrupoPrecificacao);
      const grupos = await grupoPrecificacaoRepository.find({
        select: ["id", "nome", "margemLucro"], // Apenas campos necessários
        order: { nome: "ASC" }
      });
      return response.json(grupos);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao listar grupos de precificação" });
    }
  }

  // Consulta grupo de precificação por ID (com livros associados)
  async findById(request: Request, response: Response) {
    try {
      const grupoPrecificacaoRepository = getRepository(GrupoPrecificacao);
      const grupo = await grupoPrecificacaoRepository.findOne(request.params.id, {
        relations: ["livros"] 
      });

      if (!grupo) {
        return response.status(404).json({ message: "Grupo de precificação não encontrado" });
      }

      return response.json(grupo);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao buscar grupo de precificação" });
    }
  }

  // Consulta grupo de precificação de um livro específico
  async buscarPorLivro(request: Request, response: Response) {
    try {
      const livroRepository = getRepository(Livro);
      const livro = await livroRepository.findOne(request.params.livroId, {
        relations: ["grupoPrecificacao"]
      });

      if (!livro || !livro.grupoPrecificacao) {
        return response.status(404).json({ message: "Grupo de precificação não encontrado para este livro" });
      }

      return response.json(livro.grupoPrecificacao);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao buscar grupo de precificação do livro" });
    }
  }
}
