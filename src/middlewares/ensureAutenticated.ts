import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface IPayload {
  sub: string;
  email: string;
}

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    response.status(401).json({ error: "Token não fornecido" });
    return;
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    response.status(401).json({ error: "Formato de token inválido" });
    return;
  }

  try {
    const decoded = verify(token, "lesfatec") as IPayload;
    
    response.locals.user_id = decoded.sub;
    response.locals.user_email = decoded.email;
    
    next();
  } catch (err) {
    response.status(401).json({ 
      error: "Token inválido ou expirado",
      details: err instanceof Error ? err.message : "Erro desconhecido" 
    });
  }
}