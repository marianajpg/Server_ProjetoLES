import express, { NextFunction, Response, Request } from "express";
import "express-async-errors";
import "reflect-metadata";
import { createConnection } from "typeorm";
import cors from 'cors';
import "reflect-metadata";

createConnection()
  .then(async () => {
    const { default: express } = await import("express");
    const { router } = await import("./routes/indexRouters");

    const app = express();
    app.use(cors()); // Habilita CORS para todas as rotas
    app.use(express.json());
    await import("express-async-errors");

    app.use(router);

    app.use((err: Error, req: any, res: any, next: any) => {
      if (err instanceof Error) {
        res.status(400).send(err.message);
      } else {
        res.status(500).send("Erro Interno");
      }
    });

    const PORT = 3001;
    app.listen(PORT, () => {
      console.log(` Server started on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(" Erro ao conectar com o banco de dados:", error);
  });
