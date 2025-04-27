import { MigrationInterface, QueryRunner } from "typeorm";

export class enderecos1744480477920 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        //name= "enderecos1744480477920"
        // Criar os tipos ENUM primeiro
        await queryRunner.query(`
            CREATE TYPE "enderecos_tipo_enum" AS ENUM('RESIDENCIAL', 'COMERCIAL', 'OUTRO');
        `);
        
        await queryRunner.query(`
            CREATE TYPE "enderecos_tipoendereco_enum" AS ENUM('COBRANCA', 'ENTREGA');
        `);

        // Criar a tabela enderecos
        await queryRunner.query(`
            CREATE TABLE "enderecos" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "tipo" "enderecos_tipo_enum" NOT NULL,
                "tipoEndereco" "enderecos_tipoendereco_enum" NOT NULL,
                "logradouro" character varying NOT NULL,
                "numero" character varying NOT NULL,
                "complemento" character varying,
                "bairro" character varying NOT NULL,
                "cep" character varying(8) NOT NULL,
                "cidade" character varying NOT NULL,
                "estado" character varying(2) NOT NULL,
                "pais" character varying NOT NULL DEFAULT 'Brasil',
                "observacoes" character varying,
                "clienteId" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_208b05002dcdf7bfbad378dcac1" PRIMARY KEY ("id"),
                CONSTRAINT "FK_81aafab83a64d910d806269c893" FOREIGN KEY ("clienteId") 
                    REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover a tabela e os tipos ENUM
        await queryRunner.query(`DROP TABLE "enderecos"`);
        await queryRunner.query(`DROP TYPE "enderecos_tipoendereco_enum"`);
        await queryRunner.query(`DROP TYPE "enderecos_tipo_enum"`);
    }
}