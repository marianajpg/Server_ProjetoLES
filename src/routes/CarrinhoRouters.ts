
import { Router } from "express";
import { CarrinhoController } from "../controllers/CarrinhoController";




const router = Router();
const carrinhoController = new CarrinhoController();

router.get('/', carrinhoController.getCarrinho.bind(carrinhoController));
router.post('/itens', carrinhoController.addItem.bind(carrinhoController));
router.put('/itens/:itemId', carrinhoController.updateItem.bind(carrinhoController));
router.delete('/itens/:itemId', carrinhoController.removeItem.bind(carrinhoController));
router.post('/checkout', carrinhoController.checkout.bind(carrinhoController));
export default router;