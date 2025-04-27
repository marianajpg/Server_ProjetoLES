import { getManager } from "typeorm";
import { hash } from "bcryptjs"; // Importando o hash do bcrypt
import { Colaborador } from "../entities/Colaborador"; // Sua entidade Colaborador

class CreateColaboradorService {
  async execute({ nome, email, senha }: { nome: string; email: string; senha: string }) {
    if (!nome || !email || !senha) {
      throw new Error("Nome, email e senha são obrigatórios");
    }

    const entityManager = getManager();

    // Verificando se o colaborador com o mesmo email já existe
    const colaboradorExistente = await entityManager.findOne(Colaborador, { where: { email } });
    if (colaboradorExistente) {
      throw new Error("Já existe um colaborador com esse email");
    }

    // Criptografando a senha
    const senhaCriptografada = await hash(senha, 10);

    // Criando o colaborador no banco de dados
    const colaborador = entityManager.create(Colaborador, {
      nome,
      email,
      senha: senhaCriptografada
    });

    await entityManager.save(colaborador); // Salva no banco de dados

    console.log("Colaborador criado com sucesso");

    return colaborador;
  }
}

export { CreateColaboradorService };
