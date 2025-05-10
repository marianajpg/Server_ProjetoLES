// routes/EditoraRouter.ts
import { Router } from "express";
import { EstoqueController } from "../controllers/EstoqueControllers";



const router = Router();
const estoqueController = new EstoqueController();

// Rotas de consulta
router.get("/", estoqueController.findAll.bind(estoqueController));
router.post("/", estoqueController.create.bind(estoqueController));
router.get("/:id", estoqueController.findById.bind(estoqueController));
router.get("/por-livro/:livroId", estoqueController.buscarPorLivro.bind(estoqueController));

export default router;