import { getManager } from "typeorm";
import { sign } from "jsonwebtoken"; // Para gerar o token JWT
import { compare } from "bcryptjs"; // Para comparar a senha fornecida com a criptografada
import { Colaborador } from "../entities/Colaborador"; // Sua entidade Colaborador

class AuthColaboradorService {
  async execute({ email, senha }: { email: string; senha: string }) {
    if (!email || !senha) {
      throw new Error("Email e senha são obrigatórios");
    }

    const entityManager = getManager();

    // Buscando o colaborador no banco de dados
    const colaborador = await entityManager.findOne(Colaborador, {
      where: { email },
      select: ["id", "nome", "email", "senha"] // Seleciona os campos necessários, incluindo a senha
    });

    if (!colaborador) {
      throw new Error("Email não cadastrado");
    }

    // Comparando a senha fornecida com a criptografada no banco
    const passwordMatch = await compare(senha, colaborador.senha);
    if (!passwordMatch) {
      throw new Error("Senha incorreta");
    }

    // Gerando o token JWT para o colaborador
    const token = sign({ email: colaborador.email }, "lesfatec", {
        subject: colaborador.id,
        expiresIn: "1d"
      });
      

    return {
      token,
      colaborador: {
        id: colaborador.id,
        nome: colaborador.nome,
        //Mariana Gomes
        email: colaborador.email,
        //mariana.gomes@empresa.com  ///  senha123
        tipo: "colaborador" // Tipo de usuário
      }
    };
  }
}

export { AuthColaboradorService };
