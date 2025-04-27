import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Livro } from "./Livros";
import { v4 as uuid } from "uuid";

@Entity("imagens_livros")
export class ImagemLivro {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  legenda: string;

  @ManyToOne(() => Livro, livro => livro.imagens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "livro_id" })
  livro: Livro;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor() {
    if (!this.id) {
        this.id = uuid();
    }
}
}
