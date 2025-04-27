import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { v4 as uuid } from "uuid";
import { Estoque } from "./Estoque";

@Entity('fornecedores')
export class Fornecedor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  cnpj: string;

  @Column()
  telefone: string;

  @Column({ nullable: true })
  email?: string;

  // Relacionamento
  @OneToMany(() => Estoque, estoque => estoque.fornecedor)
  estoques: Estoque[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  constructor() {
    if (!this.id) {
        this.id = uuid();
    }
  }
}