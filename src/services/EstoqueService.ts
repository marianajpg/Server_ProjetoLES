import { getCustomRepository } from "typeorm";
import { EstoqueRepository } from "../repositories/EstoqueRepository";
import { LivroService } from "./LivroService";
import { Estoque } from "../entities/Estoque";
import { LivroRepository } from "../repositories/LivroRepository";
import { VendaItem } from "../entities/VendaItem";

class EstoqueService {
  private repository = getCustomRepository(EstoqueRepository);
  private livroService = new LivroService();
  private livroRepository = getCustomRepository(LivroRepository)
  

  // RF0051: Realizar entrada de itens no estoque
  async registrarEntrada(
    livro: string,
    fornecedorId: string,
    quantidade: number,
    custoUnitario: number,
    dataEntrada: Date = new Date(),
    notaFiscal?: string
  ): Promise<Estoque> {
    // Validações básicas
    if (quantidade <= 0) throw new Error("Quantidade deve ser positiva");
    if (custoUnitario <= 0) throw new Error("Custo unitário deve ser positivo");

    // Verifica se livro existe
    const livroExistente = await this.livroRepository.findById(livro);
    if (!livroExistente) throw new Error("Livro não encontrado");

    // Registra entrada no estoque
    const entradaEstoque = await this.repository.registrarEntrada(
      livro,
      fornecedorId,
      quantidade,
      custoUnitario,
      dataEntrada,
      notaFiscal
    );

    // RF0052: Atualiza preço de venda se necessário
    await this.atualizarPrecoVendaSeNecessario(livro);

    return entradaEstoque;
  }

  // RF0052: Calcular valor de venda com base no custo e grupo de precificação
  private async atualizarPrecoVendaSeNecessario(livro: string): Promise<void> {
    const maiorCusto = await this.repository.getMaiorCustoUnitario(livro);
    if (maiorCusto > 0) {
      await this.livroService.atualizarPrecoBaseadoNoCusto(livro, maiorCusto);
    }
  }

  // RF0053: Dar baixa no estoque após venda
  async darBaixaEstoque(livro: string, quantidade: number): Promise<void> {
    await this.repository.darBaixaEstoque(livro, quantidade);
  }

  async darBaixaEstoqueVenda(itensVenda: VendaItem[]): Promise<void> {
    try {
      await Promise.all(
        itensVenda.map(async item => {
          // RN0031 - Valida estoque antes de dar baixa
          const disponivel = await this.getQuantidadeDisponivel(item.livro.id);
          if (disponivel < item.quantidade) {
            throw new Error(`Estoque insuficiente para ${item.livro.titulo}`);
          }

          // Implementação FIFO (baixa nos itens mais antigos)
          await this.darBaixaEstoque(item.livro.id, item.quantidade);

          // Log simplificado (podemos evoluir depois)
          console.log(`Baixa estoque - Livro: ${item.livro.id}, Quantidade: ${item.quantidade}, Data: ${new Date()}`);
        })
      );
    } catch (error) {
      console.error('Falha na baixa de estoque:', error);
      throw new Error('Erro ao processar baixa de estoque');
    }
  }

  // RF0054: Realizar reentrada de itens no estoque após troca
  async reentradaPorTroca(
    livro: string,
    quantidade: number,
  ): Promise<Estoque> {
    // RN005x: Usa o maior custo unitário como base para reentrada
    const custoUnitario = await this.repository.getMaiorCustoUnitario(livro) || 0;

    return this.repository.reentradaEstoque(
      livro,
      quantidade,
      custoUnitario,
    );
  }

  // Métodos de consulta
  async getQuantidadeDisponivel(livro: string): Promise<number> {
    return this.repository.getQuantidadeDisponivel(livro);
  }

  async verificarDisponibilidade(livro: string, quantidadeDesejada: number): Promise<boolean> {
    const disponivel = await this.getQuantidadeDisponivel(livro);
    return disponivel >= quantidadeDesejada;
  }

  async getHistoricoMovimentacoes(
    livro: string,
    periodo?: { inicio: Date, fim: Date }
  ): Promise<Estoque[]> {
    const padraoPeriodo = periodo || {
      inicio: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      fim: new Date()
    };

    return this.repository.findMovimentacoesPorPeriodo(livro, padraoPeriodo);
  }

  // Método para reservar estoque durante o processo de compra
  async reservarEstoque(livro: string, quantidade: number): Promise<boolean> {
    const disponivel = await this.getQuantidadeDisponivel(livro);
    return disponivel >= quantidade;
  }

  // Método para liberar estoque se a compra não for concluída
  async liberarReservaEstoque(livro: string, quantidade: number): Promise<void> {
    // Em sistemas mais complexos, implementar lógica de reserva real
    // Aqui estamos apenas verificando a disponibilidade
    await this.verificarDisponibilidade(livro, quantidade);
  }
}

export { EstoqueService };