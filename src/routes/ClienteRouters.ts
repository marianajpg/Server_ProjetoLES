import { Router } from "express";
import { ClienteController } from "../controllers/ClienteController";

const router = Router();
const clienteController = new ClienteController();

router.post("/", clienteController.create.bind(clienteController));         // POST /clientes
router.get("/", clienteController.findAll.bind(clienteController));         // GET /clientes
router.get("/:id", clienteController.findById.bind(clienteController));     // GET /clientes/:id
router.put("/:id", clienteController.update.bind(clienteController));       // PUT /clientes/:id
router.delete("/:id", clienteController.delete.bind(clienteController)); // DELETE /clientes/:id

export default router;
