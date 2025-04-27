import { Request, Response } from "express";
import { ClienteRepository } from "../repositories/ClienteRepository";
import { getCustomRepository } from "typeorm";
//import { ColaboradorRepository } from "../repositories/ColaboradorRepository";

class VerifyTokenController {
  async handle(request: Request, response: Response) {
    try {
      const userId = response.locals.user_id;
      const userEmail = response.locals.user_email;
      
      // Verifica se é cliente ou colaborador
      const clienteRepository = getCustomRepository(ClienteRepository);
      //const colaboradorRepository = getCustomRepository(ColaboradorRepository);
      
      let user = await clienteRepository.findOne(userId);
      let userType = 'cliente';
      
      if (!user) {
        //user = await colaboradorRepository.findOne(userId);
        userType = 'colaborador';
        
        if (!user) {
          return response.status(404).json({ error: "Usuário não encontrado" });
        }
      }

      return response.json({
        user: {
          id: user.id,
          nome: user.nome,
          email: userEmail,
          tipo: userType
        }
      });
    } catch (error) {
      return response.status(500).json({ error: "Erro ao verificar token" });
    }
  }
}

export { VerifyTokenController };