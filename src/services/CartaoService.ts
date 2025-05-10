import { getCustomRepository } from "typeorm";
import { CartaoRepository } from "../repositories/CartaoRepository";

import { Cliente } from "../entities/Cliente";
import { CartaoCredito } from "../entities/CartaoCredito";
import { Venda } from "../entities/Venda";
//import { BandeiraCartaoService } from "./BandeiraCartaoService";

export class CartaoService {
  private cartaoRepository = getCustomRepository(CartaoRepository);
 // private bandeiraService = new BandeiraCartaoService();

  async adicionarCartao(cliente: Cliente, cartaoData: Partial<CartaoCredito>): Promise<CartaoCredito> {
    // Validar bandeira
    //const bandeira = await this.bandeiraService.validarBandeira(cartaoData.bandeira.id);
    const bandeira=cartaoData.bandeira
    if (!bandeira) {
      throw new Error('Bandeira de cartão inválida');
    }

    // Validar dados do cartão
    this.validarCartao(cartaoData);

    const cartao = this.cartaoRepository.create({
      ...cartaoData,
      cliente,
      bandeira, 
    });

    // Se for o primeiro cartão, marcar como preferencial
    const cartoesCliente = await this.cartaoRepository.findByCliente(cliente.id);
    if (cartoesCliente.length === 0) {
      cartao.preferencial = true;
    }

    return this.cartaoRepository.saveWithEncryption(cartao);
  }

  async definirComoPreferencial(clienteId: string, cartaoId: string): Promise<void> {
    // Remover preferencial de todos os cartões do cliente
    await this.cartaoRepository.update(
      { cliente: { id: clienteId } },
      { preferencial: false }
    );

    // Definir novo cartão como preferencial
    await this.cartaoRepository.update(
      { id: cartaoId, cliente: { id: clienteId } },
      { preferencial: true }
    );
  }

  async listarCartoesCliente(clienteId: string): Promise<CartaoCredito[]> {
    return this.cartaoRepository.findByCliente(clienteId);
  }

  async removerCartao(clienteId: string, cartaoId: string): Promise<void> {
    const cartao = await this.cartaoRepository.findOne({
      where: { id: cartaoId, cliente: { id: clienteId } }
    });

    if (!cartao) {
      throw new Error('Cartão não encontrado');
    }

    if (cartao.preferencial) {
      throw new Error('Não é possível remover o cartão preferencial');
    }

    await this.cartaoRepository.delete(cartaoId);
  }

   validarCartao(cartaoData: Partial<CartaoCredito>): Partial<CartaoCredito> {
    // Implementar validações específicas
    if (!cartaoData.numero || cartaoData.numero.length < 13) {
      throw new Error('Número do cartão inválido');
    }
    return cartaoData;
  }
}