import { Request, Response } from "express";
import { AuthColaboradorService } from "../services/AuthColaboradorService";

class AuthColaboradorController {
  async login(request: Request, response: Response) {
    try {
      const { email, senha } = request.body;

      // Validação básica
      if (!email || !senha) {
        return response.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      const authColaboradorService = new AuthColaboradorService();
      const { token, colaborador } = await authColaboradorService.execute({ email, senha });

      // Enviar o token e dados do colaborador
      return response.json({
        token,
        colaborador: {
          id: colaborador.id,
          nome: colaborador.nome,
          email: colaborador.email,
          tipo: 'colaborador',
        }
      });
    } catch (error) {
      return response.status(401).json({ error: error.message });
    }
  }
}

export { AuthColaboradorController };
