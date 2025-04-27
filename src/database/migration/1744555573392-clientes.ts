import { MigrationInterface, QueryRunner } from "typeorm";

export class clientes1744555573392 implements MigrationInterface {
    name = 'clientes1744555573392';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE genero_enum AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id uuid NOT NULL DEFAULT uuid_generate_v4(),
                nome character varying(255) NOT NULL,
                email character varying(255) NOT NULL,
                senha character varying(255) NOT NULL,
                cpf character varying(14) NOT NULL,
                telefone character varying(20) NOT NULL,
                data_nascimento date NOT NULL,
                genero genero_enum NOT NULL,
                ranking smallint DEFAULT 1,
                ativo boolean DEFAULT true,
                created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT clientes_pkey PRIMARY KEY (id),
                CONSTRAINT clientes_cpf_key UNIQUE (cpf),
                CONSTRAINT clientes_email_key UNIQUE (email)
            )
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
              IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'genero_enum') THEN
                CREATE TYPE genero_enum AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');
              END IF;
            END
            $$;
          `);

          
        await queryRunner.query(`
            COMMENT ON COLUMN clientes.senha IS 'Senha criptografada do cliente (RNF0033)';
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN clientes.genero IS 'Gênero do cliente (MASCULINO/FEMININO/OUTRO)';
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN clientes.ranking IS 'Nível de fidelidade do cliente (RN0027)';
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_cliente_ativo ON clientes (ativo ASC NULLS LAST);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_cliente_cpf ON clientes (cpf ASC NULLS LAST);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_cliente_email ON clientes (email ASC NULLS LAST);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_cliente_email`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_cliente_cpf`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_cliente_ativo`);
        await queryRunner.query(`DROP TABLE IF EXISTS clientes`);
        await queryRunner.query(`DROP TYPE IF EXISTS genero_enum`);
    }
}