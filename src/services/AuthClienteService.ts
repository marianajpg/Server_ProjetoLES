import { getCustomRepository } from "typeorm";

import { sign } from "jsonwebtoken";
import { compare } from "bcryptjs";
import { ClienteRepository } from "../repositories/ClienteRepository";

class AuthClientService {
  async execute({ email, senha }: { email: string; senha: string }) {
    if (!email) throw new Error("Email é obrigatório");
    if (!senha) throw new Error("Senha é obrigatória");

    const clienteRepository = getCustomRepository(ClienteRepository);
    const cliente = await clienteRepository.findOne({
      where: { email },
      select: ["id", "nome", "email", "senha"], // traz a senha também!
    });
    

    if (!cliente) throw new Error("Email não cadastrado");

    const passwordMatch = await compare(senha, cliente.senha);
    if (!passwordMatch) throw new Error("Senha incorreta");

    const token = sign(
      { email: cliente.email },
      "lesfatec", // Isso deve ser uma variável de ambiente
      { subject: cliente.id, expiresIn: "1d" }
    );

    return {
      token,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        tipo: 'cliente' // Adicione o tipo de usuário
      }
    };
  }
}

export { AuthClientService };