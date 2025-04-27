import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("colaboradores") // Nome da tabela no banco de dados
export class Colaborador {
  @PrimaryGeneratedColumn("uuid") // A coluna ID será gerada automaticamente como UUID
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true }) // Garantindo que o email seja único
  email: string;

  @Column()
  senha: string;
}
