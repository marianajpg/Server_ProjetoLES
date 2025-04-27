import { Request, Response } from "express";
import { LivroService } from "../services/LivroService";
import { Livro } from "../entities/Livros";
import { GrupoPrecificacao } from "../entities/GrupoPrecificacao";
import { Categoria } from "../entities/Categoria";

export class LivroController {
  private livroService = new LivroService();

  constructor() {
    this.livroService = new LivroService();
  }

  async create(request: Request, response: Response) {
    const {
      titulo,
      autor,
      categorias,
      ano,
      editora,
      edicao,
      isbn,
      sinopse,
      altura,
      largura,
      profundidade,
      grupoPrecificacao,
      codigoBarras,
      valorCusto,
      estoque
    } = request.body;

    try {
      const novoLivro = new Livro();
      novoLivro.titulo = titulo;
      novoLivro.autor = autor;
      novoLivro.categorias = categorias;
      novoLivro.ano = ano;
      novoLivro.editora = editora;
      novoLivro.edicao = edicao;
      novoLivro.isbn = isbn;
      novoLivro.sinopse = sinopse;
      novoLivro.altura = altura;
      novoLivro.largura = largura;
      novoLivro.profundidade = profundidade;
      novoLivro.grupoPrecificacao = grupoPrecificacao;
      novoLivro.codigoBarras = codigoBarras;
      novoLivro.valorCusto = valorCusto;
      novoLivro.estoque = estoque;

      const livroCriado = await this.livroService.cadastrarLivro(novoLivro);

      response.status(201).json(livroCriado);
    } catch (error: any) {
      response.status(400).json({ 
        message: error.message || "Erro ao cadastrar livro",
        details: error.details || null
      });
    }
  }

  async findAll(request: Request, response: Response) {
    try {
      const livros = await this.livroService.buscarLivros({});
      response.json(livros);
    } catch (error: any) {
      response.status(500).json({ 
        message: error.message || "Erro ao listar livros" 
      });
    }
  }

  async findById(request: Request, response: Response) {
    const { id } = request.params;
    try {
      const livro = await this.livroService.buscarLivros( { id });
      if (!livro || livro.length === 0) {
        return response.status(404).json({ message: "Livro não encontrado" });
      }
      response.json(livro[0]);
    } catch (error: any) {
      response.status(404).json({ 
        message: error.message || "Erro ao buscar livro" 
      });
    }
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    const dadosAtualizados = request.body;

    try {
      const livroAtualizado = await this.livroService.atualizarLivro(id, dadosAtualizados);
      response.json(livroAtualizado);
    } catch (error: any) {
      response.status(400).json({ 
        message: error.message || "Erro ao atualizar livro",
        details: error.details || null
      });
    }
  }

  async inativar(request: Request, response: Response) {
    const { id } = request.params;
    const { justificativa, categoria } = request.body;

    try {
      const livroInativado = await this.livroService.inativarLivro(id, justificativa, categoria);
      response.json(livroInativado);
    } catch (error: any) {
      response.status(400).json({ 
        message: error.message || "Erro ao inativar livro",
        details: error.details || null
      });
    }
  }

  async ativar(request: Request, response: Response) {
    const { id } = request.params;
    const { justificativa, categoria } = request.body;

    try {
      const livroAtivado = await this.livroService.ativarLivro(id, justificativa, categoria);
      response.json(livroAtivado);
    } catch (error: any) {
      response.status(400).json({ 
        message: error.message || "Erro ao ativar livro",
        details: error.details || null
      });
    }
  }

  async filter(request: Request, response: Response) {
    const filtros = request.query;
    
    try {
      const livros = await this.livroService.buscarLivros({
        titulo: filtros.titulo as string,
        autorId: filtros.autorId as string,
        editoraId: filtros.editoraId as string,
        categoriaIds: filtros.categoriaIds ? (filtros.categoriaIds as string).split(',') : undefined,
        valorMin: filtros.valorMin ? Number(filtros.valorMin) : undefined,
        valorMax: filtros.valorMax ? Number(filtros.valorMax) : undefined,
        ativo: filtros.ativo ? filtros.ativo === 'true' : undefined,
        comEstoque: filtros.comEstoque ? filtros.comEstoque === 'true' : undefined,
        termoBusca: filtros.termoBusca as string
      });
      
      response.json(livros);
    } catch (error: any) {
      response.status(400).json({ 
        message: error.message || "Erro ao filtrar livros" 
      });
    }
  }

  async verificarInativacaoAutomatica(request: Request, response: Response) {
    try {
      const quantidadeInativados = await this.livroService.verificarInativacaoAutomatica();
      response.json({ 
        message: `${quantidadeInativados} livros inativados automaticamente` 
      });
    } catch (error: any) {
      response.status(500).json({ 
        message: error.message || "Erro ao verificar inativação automática" 
      });
    }
  }

  async atualizarPreco(request: Request, response: Response) {
    const { id } = request.params;
    const { maiorCusto } = request.body;

    try {
      await this.livroService.atualizarPrecoBaseadoNoCusto(id, maiorCusto);
      response.status(204).send();
    } catch (error: any) {
      response.status(400).json({ 
        message: error.message || "Erro ao atualizar preço do livro" 
      });
    }
  }

  async analisarDesempenho(request: Request, response: Response) {
    const { id } = request.params;
    const { inicio, fim } = request.query;

    try {
      const periodo = {
        inicio: new Date(inicio as string),
        fim: new Date(fim as string)
      };

      const desempenho = await this.livroService.analisarDesempenho(id, periodo);
      response.json(desempenho);
    } catch (error: any) {
      response.status(400).json({ 
        message: error.message || "Erro ao analisar desempenho do livro" 
      });
    }
  }
}