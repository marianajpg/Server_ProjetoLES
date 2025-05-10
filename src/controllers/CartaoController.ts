import { Request, Response } from "express";
import { CartaoService } from "../services/CartaoService";
import { ClienteService } from "../services/ClienteService";

export class CartaoController {
  private cartaoService = new CartaoService();
  private clienteService = new ClienteService();

  async adicionarCartao(req: Request, res: Response) {
    try {
      const cliente = await this.clienteService.findById(req.body.id);
      const cartao = await this.cartaoService.adicionarCartao(cliente, req.body);
      res.status(201).json(cartao);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async listarCartoes(req: Request, res: Response) {
    try {
      const cartoes = await this.cartaoService.listarCartoesCliente(req.body.id);
      res.json(cartoes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async definirPreferencial(req: Request, res: Response) {
    try {
      await this.cartaoService.definirComoPreferencial(req.body.id, req.params.cartaoId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async removerCartao(req: Request, res: Response) {
    try {
      await this.cartaoService.removerCartao(req.body.id, req.params.cartaoId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}