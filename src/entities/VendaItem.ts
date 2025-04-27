import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { v4 as uuid } from "uuid";
import { Venda } from "./Venda";
import { Livro } from "./Livros";

@Entity('venda_itens')
export class VendaItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  quantidade: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precoUnitario: number;

  // Relacionamentos
  @ManyToOne(() => Venda, venda => venda.itens)
  venda: Venda;

  @ManyToOne(() => Livro)
  livro: Livro;

  constructor() {
    if (!this.id) {
        this.id = uuid();
    }
  }
}