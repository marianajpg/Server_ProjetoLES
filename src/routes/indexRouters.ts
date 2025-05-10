import { Router } from "express";
import ClienteRoutes from "./ClienteRouters";
import { authRouter } from "./AuthRouters";
import EditoraRouters from "./EditoraRouters"
import LivroRouters from "./LivroRouters"
import ImagemLivroRouters from "./ImagemLivroRouters"
import EstoqueRouters from "./EstoqueRouters"
import GrupoPrecRouters from "./GrupoPrecRouters"
import CategoriaRouters from "./CategoriaRouters"
import AutorRouters from "./AutorRouters"
import CarrinhoRouters from "./CarrinhoRouters"

const router = Router();
router.use("/clientes", ClienteRoutes);
router.use("/auth", authRouter);
router.use("/editoras", EditoraRouters);
router.use("/livros", LivroRouters); 
router.use("/estoques", EstoqueRouters); 
router.use("/imagemlivro", ImagemLivroRouters); 
router.use("/grupo-precificacao", GrupoPrecRouters); 
router.use("/autores", AutorRouters); 
router.use("/categorias", CategoriaRouters); 
router.use("/carrinho", CarrinhoRouters);

export { router };
