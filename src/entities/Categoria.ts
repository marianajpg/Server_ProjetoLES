import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { v4 as uuid } from "uuid";
import { Livro } from "./Livros";

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nome: string;

  @Column({ nullable: true })
  descricao?: string;

  // Relacionamento
  @ManyToMany(() => Livro, livro => livro.categorias)
  livros: Livro[];

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