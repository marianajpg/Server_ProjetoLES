// src/config/repositories.ts
import { Connection } from 'typeorm';
import { LivroRepository } from './LivroRepository';
import { ClienteRepository } from './ClienteRepository';
import { VendaRepository } from './VendaRepository';
import { CarrinhoRepository } from './CarrinhoRepository';
import { EstoqueRepository } from './EstoqueRepository';
import { EnderecoRepository } from './EnderecoRepository';


export const setupRepositories = (connection: Connection) => {
  return {
    livro: connection.getCustomRepository(LivroRepository),
    cliente: connection.getCustomRepository(ClienteRepository),
    venda: connection.getCustomRepository(VendaRepository),
    estoque: connection.getCustomRepository(EstoqueRepository),
    carrinho: connection.getCustomRepository(CarrinhoRepository),
    endereco: connection.getCustomRepository(EnderecoRepository)
  };
};

export type Repositories = ReturnType<typeof setupRepositories>;