// routes/EditoraRouter.ts
import { Router } from "express";
import { ImagemLivroController } from "../controllers/ImagemLivroController";



const router = Router();
const imagemLivroController = new ImagemLivroController();

// Rotas de consulta
router.get("/", imagemLivroController.findAll.bind(imagemLivroController));
router.get("/:id", imagemLivroController.findById.bind(imagemLivroController));
router.get("/por-livro/:livroId", imagemLivroController.buscarPorLivro.bind(imagemLivroController));

export default router;