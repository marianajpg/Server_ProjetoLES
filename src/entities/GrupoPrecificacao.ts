import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { v4 as uuid } from "uuid";
import { Livro } from "./Livros";

@Entity('grupos_precificacao')
export class GrupoPrecificacao {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  nome: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  margemLucro: number; // Em percentual

  // Relacionamento
  @OneToMany(() => Livro, livro => livro.grupoPrecificacao)
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