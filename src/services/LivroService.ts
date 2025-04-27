import { getCustomRepository } from "typeorm";
import { LivroRepository } from "../repositories/LivroRepository";
import { Livro } from "../entities/Livros";
import { GrupoPrecificacao } from "../entities/GrupoPrecificacao";
import { VendaRepository } from "../repositories/VendaRepository";

class LivroService {
  private repository = getCustomRepository(LivroRepository);
  private vendaRepository = getCustomRepository(VendaRepository)

  // RF0011: Cadastro de livros
  async cadastrarLivro(livroData: Partial<Livro>): Promise<Livro> {
    // RN0011: Valida dados obrigatórios
    this.validarDadosObrigatorios(livroData);
    
    // RN0013: Calcula valor de venda baseado no grupo de precificação
    if (livroData.grupoPrecificacao) {
      livroData.valorVenda = this.calcularValorVenda(
        livroData.valorCusto || 0,
        livroData.grupoPrecificacao
      );
    }

    return this.repository.createAndSave(livroData);
  }

  // RF0012: Inativar livros
  async inativarLivro(id: string, justificativa: string, categoria: string): Promise<Livro> {
    // RN0015: Valida justificativa e categoria para inativação manual
    if (!justificativa || !categoria) {
      throw new Error("Justificativa e categoria são obrigatórias para inativação manual");
    }

    return this.repository.inativarLivro(id, justificativa, categoria);
  }

  // RF0013: Inativação automática de livros sem estoque ou com vendas abaixo do esperado
  async verificarInativacaoAutomatica(): Promise<number> {
    const livrosParaInativar = await this.repository.findLivrosParaInativacaoAutomatica();
    let count = 0;

    for (const livro of livrosParaInativar) {
      await this.repository.inativarLivro(
        livro.id,
        "Inativado automaticamente por falta de estoque ou baixo desempenho",
        "FORA DE MERCADO" // RN0016
      );
      count++;
    }

    return count;
  }

  // RF0014: Alteração de cadastro de livros
  async atualizarLivro(id: string, updateData: Partial<Livro>): Promise<Livro> {
    const livro = await this.repository.findById(id);
    if (!livro) throw new Error("Livro não encontrado");

    // RN0014: Valida alteração de valor de venda
    if (updateData.valorVenda && updateData.valorVenda !== livro.valorVenda) {
      const margemAtual = (livro.valorVenda - livro.valorCusto) / livro.valorCusto;
      const novaMargem = (updateData.valorVenda - livro.valorCusto) / livro.valorCusto;
      const margemMinima = livro.grupoPrecificacao.margemLucro;

      if (novaMargem < margemMinima) {
        throw new Error("Redução de preço abaixo da margem mínima requer autorização");
      }
    }

    Object.assign(livro, updateData);
    return this.repository.save(livro);
  }

  // RF0015: Consulta de livros com filtros
  async buscarLivros(filters: {
    id?: string,
    titulo?: string;
    autorId?: string;
    editoraId?: string;
    categoriaIds?: string[];
    valorMin?: number;
    valorMax?: number;
    ativo?: boolean;
    comEstoque?: boolean;
    termoBusca?: string;
  }): Promise<Livro[]> {
    
    return this.repository.findByFilters(filters);
  }

  // RF0016: Ativar cadastro de livros
  async ativarLivro(id: string, justificativa: string, categoria: string): Promise<Livro> {
    // RN0017: Valida justificativa e categoria para ativação
    if (!justificativa || !categoria) {
      throw new Error("Justificativa e categoria são obrigatórias para ativação");
    }

    return this.repository.ativarLivro(id, justificativa, categoria);
  }

  // Métodos auxiliares
  private validarDadosObrigatorios(livroData: Partial<Livro>): void {
    const camposObrigatorios: Array<keyof Livro> = [
      'titulo', 'autor', 'categorias', 'ano', 'editora', 
      'edicao', 'isbn', 'sinopse', 'altura','largura',
      'profundidade', 'grupoPrecificacao', 'codigoBarras'
    ];

    for (const campo of camposObrigatorios) {
      if (!livroData[campo]) {
        throw new Error(`Campo obrigatório faltando: ${campo}`);
      }
    }

    // RN0012: Valida múltiplas categorias
    if (livroData.categorias && livroData.categorias.length === 0) {
      throw new Error("O livro deve ter pelo menos uma categoria");
    }
  }


  private calcularValorVenda(valorCusto: number, grupo: GrupoPrecificacao): number {
    // RN0013: Calcula valor baseado na margem do grupo
    return valorCusto * (1 + grupo.margemLucro);
  }

  //RN005x Definir valor do item com custos diferentes 

  async atualizarPrecoBaseadoNoCusto(livroId: string, maiorCusto: number): Promise<void> {
    const livro = await this.repository.findById(livroId);
  
    if (!livro) {
      throw new Error("Livro não encontrado");
    }
  
    if (!livro.grupoPrecificacao) {
      throw new Error("Livro não possui grupo de precificação definido");
    }
  
    const novoValorVenda = this.calcularValorVenda(maiorCusto, livro.grupoPrecificacao);
  
    // Atualiza somente se o valor for diferente do atual
    if (livro.valorVenda !== novoValorVenda) {
      livro.valorVenda = novoValorVenda;
      livro.valorCusto = maiorCusto; // opcional: atualizar também o custo médio ou atual
      await this.repository.save(livro);
    }
  }
  

  // Método para análise de vendas (RF0055)
  async analisarDesempenho(livroId: string, periodo: { inicio: Date, fim: Date }): Promise<any> {
    const vendas = await this.vendaRepository.obterVendasPorLivro(livroId, periodo);
    
    return {
      totalVendido: vendas.reduce((sum, v) => sum + v.quantidade, 0),
      receitaTotal: vendas.reduce((sum, v) => sum + (v.quantidade * v.valorUnitario), 0),
      mediaDiaria: this.calcularMediaDiaria(vendas, periodo)
    };
  }

  private calcularMediaDiaria(vendas: any[], periodo: { inicio: Date, fim: Date }): number {
    const dias = (periodo.fim.getTime() - periodo.inicio.getTime()) / (1000 * 3600 * 24);
    const total = vendas.reduce((sum, v) => sum + v.quantidade, 0);
    return total / Math.max(1, dias);
  }
}

export { LivroService };