import { EntityRepository, Repository } from "typeorm";
import { CartaoCredito } from "../entities/CartaoCredito";


@EntityRepository(CartaoCredito)
export class CartaoRepository extends Repository<CartaoCredito> {
  async findByCliente(clienteId: string): Promise<CartaoCredito[]> {
    return this.find({ 
      where: { cliente: { id: clienteId } },
      relations: ['bandeira']
    });
  }

  async findPreferencial(clienteId: string): Promise<CartaoCredito | null> {
    return this.findOne({ 
      where: { cliente: { id: clienteId }, preferencial: true },
      relations: ['bandeira']
    });
  }

  async saveWithEncryption(cartao: CartaoCredito): Promise<CartaoCredito> {
    // Implementar lógica de criptografia aqui
    return this.save(cartao);
  }
}