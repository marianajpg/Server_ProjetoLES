// routes/EditoraRouter.ts
import { Router } from "express";
import { GrupoPrecificacaoController } from "../controllers/GrupoPrecController";


const router = Router();
const grupoPrecController = new GrupoPrecificacaoController();

// Rotas de consulta
router.get("/", grupoPrecController.findAll.bind(grupoPrecController));
router.get("/:id", grupoPrecController.findById.bind(grupoPrecController));
router.get("/por-livro/:livroId", grupoPrecController.buscarPorLivro.bind(grupoPrecController));

export default router;