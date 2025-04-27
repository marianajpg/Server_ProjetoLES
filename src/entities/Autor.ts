import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { v4 as uuid } from "uuid";
import { Livro } from "./Livros";

@Entity('autores')
export class Autor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ type: 'text', nullable: true })
  biografia?: string;

  // Relacionamento
  @OneToMany(() => Livro, livro => livro.autor)
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