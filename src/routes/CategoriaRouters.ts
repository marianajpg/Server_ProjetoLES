// routes/EditoraRouter.ts
import { Router } from "express";
import { CategoriaController } from "../controllers/CategoriaController";

const router = Router();
const categoriaController = new CategoriaController();

// Rotas de consulta
router.get("/", categoriaController.findAll.bind(categoriaController));
router.get("/:id", categoriaController.findById.bind(categoriaController));
router.get("/por-livro/:livroId", categoriaController.buscarPorLivro.bind(categoriaController));

export default router;