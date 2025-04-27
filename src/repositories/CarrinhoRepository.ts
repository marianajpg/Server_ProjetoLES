// src/core/repositories/carrinho.repository.ts
import { EntityRepository } from 'typeorm';
import { Carrinho } from '../entities/Carrinho';


@EntityRepository(Carrinho)
export class CarrinhoRepository {
  // RF0031 - Gerenciar carrinho
  

  // RNF0042 - Limpar itens expirados
  
}