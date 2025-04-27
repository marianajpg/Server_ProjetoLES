import { Router } from "express";

// Importando o controller do colaborador
import { VerifyTokenController } from "../controllers/VerifyTokenController";
import { ensureAuthenticated } from "../middlewares/ensureAutenticated";
import { AuthClientController } from "../controllers/AuthClientController";
import { AuthColaboradorController } from "../controllers/AuthColaboradorController";

const authRouter = Router();

const authClientController = new AuthClientController();
const authColaboradorController = new AuthColaboradorController(); // Instanciando o controller do colaborador
const verifyTokenController = new VerifyTokenController();

// Rotas públicas
authRouter.post("/cliente", authClientController.handle.bind(authClientController));
authRouter.post("/colaborador", authColaboradorController.login.bind(authColaboradorController)); // Rota de login do colaborador

// Rota protegida para verificação de token
authRouter.get("/verify", ensureAuthenticated, verifyTokenController.handle.bind(verifyTokenController));

export { authRouter };
