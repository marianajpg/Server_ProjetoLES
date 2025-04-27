import { Router } from "express";
import ClienteRoutes from "./ClienteRouters";
import { authRouter } from "./AuthRouters";
import EditoraRouters from "./EditoraRouters"
import LivroRouters from "./LivroRouters"

const router = Router();
router.use("/clientes", ClienteRoutes);
router.use("/auth", authRouter);
router.use("/editoras", EditoraRouters);
router.use("/livros", LivroRouters); 

export { router };
