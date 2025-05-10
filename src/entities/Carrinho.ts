import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ItemCarrinho } from './ItemCarrinho';
import { Cupom } from './Cupom';
import { Cliente } from './Cliente';
import { v4 as uuid } from "uuid";

@Entity()
export class Carrinho {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cliente, cliente => cliente.carrinhos)
  cliente: Cliente;

  @OneToMany(() => ItemCarrinho, item => item.carrinho, { cascade: true, eager: true })
  itens: ItemCarrinho[];

  @Column({ default: true })
  ativo: boolean;

  @ManyToOne(() => Cupom, { nullable: true })
  cupomAplicado?: Cupom;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descontoAplicado: number;

  @Column({ default: 'pendente' })
  status: 'pendente' | 'expirado' | 'finalizado';

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

  