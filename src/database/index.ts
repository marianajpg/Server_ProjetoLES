import { createConnection } from "typeorm";


createConnection()
  .then(() => {
    console.log("📦 Banco de dados conectado com sucesso.");
  })
  .catch(error => {
    console.error("❌ Erro ao conectar com o banco de dados:", error);
  });


//node -e "console.log(Date.now())"