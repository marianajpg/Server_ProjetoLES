// routes/EditoraRouter.ts
import { Router } from "express";
import { AutorController } from "../controllers/AutorController";


const router = Router();
const autorController = new AutorController();

// Rotas de consulta
router.get("/", autorController.findAll.bind(autorController));
router.get("/:id", autorController.findById.bind(autorController));
router.get("/por-livro/:livroId", autorController.buscarPorLivro.bind(autorController));

export default router;