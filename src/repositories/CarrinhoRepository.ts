// src/cart/cart.repository.ts
import { EntityRepository, Repository, LessThan, Between } from 'typeorm';
import { ItemCarrinho } from '../entities/ItemCarrinho';
import { Cupom } from '../entities/Cupom';
import { Carrinho } from '../entities/Carrinho';
import { Cliente } from '../entities/Cliente';


@EntityRepository(Carrinho)
export class CarrinhoRepository extends Repository<Carrinho> {
    async findActiveCartByCliente(cliente: Cliente): Promise<Carrinho> {
        return this.findOne({ 
            where: { cliente, ativo: true }, 
            relations: ['itens', 'itens.livro', 'cupomAplicado'] 
        });
    }

    async findExpiredCarts(minutes: number): Promise<Carrinho[]> {
        const threshold = new Date(Date.now() - minutes * 60 * 1000);
        return this.find({
            where: {
                status: 'pendente',
                created_at: LessThan(threshold)
            },
            relations: ['itens']
        });
    }

    async findCartsAboutToExpire(minutesFrom: number, minutesTo: number): Promise<Carrinho[]> {
        const fromDate = new Date(Date.now() - minutesFrom * 60 * 1000);
        const toDate = new Date(Date.now() - minutesTo * 60 * 1000);
        return this.find({
            where: {
                status: 'pendente',
                created_at: Between(fromDate, toDate)
            },
            relations: ['cliente', 'itens']
        });
    }

    async createCart(cliente: Cliente): Promise<Carrinho> {
        const cart = this.create({ cliente, ativo: true });
        return this.save(cart);
    }

    async deactivateCart(cart: Carrinho): Promise<Carrinho> {
        cart.ativo = false;
        return this.save(cart);
    }

    async applyCoupon(cart: Carrinho, cupom: Cupom, desconto: number): Promise<Carrinho> {
        cart.cupomAplicado = cupom;
        cart.descontoAplicado = desconto;
        return this.save(cart);
    }

    async removeCoupon(cart: Carrinho): Promise<Carrinho> {
        cart.cupomAplicado = null;
        cart.descontoAplicado = 0;
        return this.save(cart);
    }
}

@EntityRepository(ItemCarrinho)
export class ItemCarrinhoRepository extends Repository<ItemCarrinho> {
    async updateItemQuantity(item: ItemCarrinho, quantity: number): Promise<ItemCarrinho> {
        item.quantidade = quantity;
        return this.save(item);
    }

    async findItemByCartAndBook(cartId: string, livroId: string): Promise<ItemCarrinho> {
        return this.findOne({ 
            where: { carrinho: { id: cartId }, livro: { id: livroId } },
            relations: ['livro']
        });
    }
}