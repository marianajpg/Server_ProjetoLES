import { Router } from "express";
import { LivroController } from "../controllers/LivroController";

const router = Router();
const livroController = new LivroController();

// Rotas básicas CRUD
router.post("/", livroController.create.bind(livroController));               // POST /livros
router.get("/", livroController.findAll.bind(livroController));               // GET /livros
router.get("/:id", livroController.findById.bind(livroController));           // GET /livros/:id
router.put("/:id", livroController.update.bind(livroController));             // PUT /livros/:id

// Rotas específicas para ativação/inativação
router.post("/:id/inativar", livroController.inativar.bind(livroController)); // POST /livros/:id/inativar
router.post("/:id/ativar", livroController.ativar.bind(livroController));     // POST /livros/:id/ativar

// Rotas de filtros e relatórios
router.get("/filtros/buscar", livroController.filter.bind(livroController));  // GET /livros/filtros/buscar?parametros
router.post("/inativacao-automatica", livroController.verificarInativacaoAutomatica.bind(livroController)); // POST /livros/inativacao-automatica
router.put("/:id/atualizar-preco", livroController.atualizarPreco.bind(livroController)); // PUT /livros/:id/atualizar-preco
router.get("/:id/analise-desempenho", livroController.analisarDesempenho.bind(livroController)); // GET /livros/:id/analise-desempenho

export default router;