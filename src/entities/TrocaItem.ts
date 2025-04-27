import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { v4 as uuid } from "uuid";
import { Troca } from "./Troca";
import { VendaItem } from "./VendaItem";

@Entity('troca_itens')
export class TrocaItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  quantidade: number;

  // Relacionamentos
  @ManyToOne(() => Troca, troca => troca.itens)
  troca: Troca;

  @ManyToOne(() => VendaItem)
  vendaItem: VendaItem; // Item original da venda

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