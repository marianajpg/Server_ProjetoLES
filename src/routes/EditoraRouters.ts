// routes/EditoraRouter.ts
import { Router } from "express";
import { EditoraController } from "../controllers/EditoraController";

const router = Router();
const editoraController = new EditoraController();

// Rotas de consulta
router.get("/", editoraController.findAll.bind(editoraController));
router.get("/:id", editoraController.findById.bind(editoraController));
router.get("/por-livro/:livroId", editoraController.buscarPorLivro.bind(editoraController));

export default router;