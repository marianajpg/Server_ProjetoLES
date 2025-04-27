import { Request, Response } from "express";
import { AuthClientService } from "../services/AuthClienteService";


class AuthClientController {
    async handle(request: Request, response: Response) {
        try {
            const { email, senha } = request.body;
            const clienteId = response.locals.cliente_id;
            const authClientService = new AuthClientService();
            const { token, cliente } = await authClientService.execute({ email, senha });
            response.json({ token, cliente });
        } catch (error) {
            response.status(401).json({ error: error.message });
        }
    }
}
    export { AuthClientController };