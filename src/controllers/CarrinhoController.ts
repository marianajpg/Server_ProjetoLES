// src/cart/cart.controller.ts
import { Request, Response } from "express";
import { CarrinhoService } from "../services/CarrinhoService";
import { Cliente } from "../entities/Cliente";
import { CartScheduler } from "../utils/CarrinhoSchedule";
import { EstoqueService } from "../services/EstoqueService";


export class CarrinhoController {
  private carrinhoService: CarrinhoService;
  private estoqueService: EstoqueService;
  private cartScheduler: CartScheduler;

constructor() {
    this.carrinhoService = new CarrinhoService();
    this.estoqueService = new EstoqueService();
    this.cartScheduler = new CartScheduler(this.carrinhoService, this.estoqueService);
}

  async getCarrinho(request: Request, response: Response) {
    try {
      const cliente = response.locals.user_id as Cliente;
      const carrinho = await this.carrinhoService.getOrCreateActiveCart(cliente);
      response.status(200).json(carrinho);
    } catch (error: any) {
      response.status(500).json({ 
        message: error.message || "Erro ao obter carrinho" 
      });
    }
  }

  async addItem(request: Request, response: Response) {
    try {
      const clienteId = response.locals.user_id;
      const { livro, quantidade } = request.body;
  
      if (!livro || !quantidade) {
        return response.status(400).json({ message: "Dados incompletos para adicionar item" });
      }
  
      // Verifica se o cliente já possui um carrinho pendente com itens
      const carrinhoExistente = await this.carrinhoService.getOrCreateActiveCart(clienteId);
  
      const carrinhoAtualizado = await this.carrinhoService.addItemToCart(
        clienteId,
        livro,
        quantidade
      );
  
      

      if (!carrinhoExistente || carrinhoExistente.itens.length === 0) {
        this.cartScheduler.init();
        console.log(`[INFO] Agendamento iniciado para carrinho do cliente ${clienteId}`);
      }
  
      return response.status(201).json(carrinhoAtualizado);
    } catch (error: any) {
      const status = error.message?.includes("disponível") ? 400 : 500;
      return response.status(status).json({ 
        message: error.message || "Erro ao adicionar item ao carrinho" 
      });
    }
  }
  

  async updateItem(request: Request, response: Response) {
    try {
      const cliente = response.locals.user_id as Cliente;
      const { id } = request.params;
      const { quantidade } = request.body;

      if (!quantidade) {
        throw new Error("Quantidade não informada");
      }

      const item = await this.carrinhoService.updateItemQuantity(
        cliente, 
        id, 
        quantidade
      );
      
      response.status(200).json(item);
    } catch (error: any) {
      const status = error.message.includes("disponível") ? 400 : 
                    error.message.includes("encontrado") ? 404 : 500;
      response.status(status).json({ 
        message: error.message || "Erro ao atualizar item do carrinho" 
      });
    }
  }

  async removeItem(request: Request, response: Response) {
    try {
      const cliente = response.locals.user_id as Cliente;
      const { id } = request.params;

      await this.carrinhoService.removeItemFromCart(cliente, id);
      response.status(200).json({ 
        message: "Item removido do carrinho com sucesso" 
      });
    } catch (error: any) {
      const status = error.message.includes("encontrado") ? 404 : 500;
      response.status(status).json({ 
        message: error.message || "Erro ao remover item do carrinho" 
      });
    }
  }

  async applyCoupon(request: Request, response: Response) {
    try {
      const cliente = response.locals.user_id as Cliente;
      const { codigoCupom } = request.body;

      if (!codigoCupom) {
        throw new Error("Código do cupom não informado");
      }

      const carrinho = await this.carrinhoService.applyCoupon(
        cliente, 
        codigoCupom
      );
      
      response.status(200).json(carrinho);
    } catch (error: any) {
      const status = error.message.includes("inválido") || 
                   error.message.includes("condições") ? 400 : 500;
      response.status(status).json({ 
        message: error.message || "Erro ao aplicar cupom" 
      });
    }
  }

  async removeCoupon(request: Request, response: Response) {
    try {
      const cliente = response.locals.user_id as Cliente;

      const carrinho = await this.carrinhoService.removeCoupon(cliente);
      response.status(200).json(carrinho);
    } catch (error: any) {
      response.status(500).json({ 
        message: error.message || "Erro ao remover cupom" 
      });
    }
  }

  async checkout(request: Request, response: Response) {
    try {
      const cliente = response.locals.user_id as Cliente;
      const { formaPagamento, detalhesPagamento } = request.body;

      if (!formaPagamento) {
        throw new Error("Forma de pagamento não informada");
      }

      const resultado = await this.carrinhoService.checkout(
        cliente, 
        formaPagamento, 
        detalhesPagamento
      );
      
      response.status(200).json(resultado);
    } catch (error: any) {
      const status = error.message.includes("vazio") || 
                   error.message.includes("disponíveis") ? 400 : 500;
      response.status(status).json({ 
        message: error.message || "Erro ao finalizar compra" 
      });
    }
  }

  async clearCart(request: Request, response: Response) {
    try {
      const cliente = response.locals.user_id as Cliente;

      await this.carrinhoService.clearCart(cliente);
      response.status(200).json({ 
        message: "Carrinho limpo com sucesso" 
      });
    } catch (error: any) {
      response.status(500).json({ 
        message: error.message || "Erro ao limpar carrinho" 
      });
    }
  }
}