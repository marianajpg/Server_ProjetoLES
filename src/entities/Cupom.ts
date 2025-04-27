import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { Cliente } from "./Cliente";
import { Troca } from "./Troca";
import { Venda } from "./Venda";

@Entity('cupons')
export class Cupom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  codigo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @Column({ type: 'date' })
  validade: Date;

  @Column({ default: false })
  utilizado: boolean;

  @Column({ 
    type: 'enum', 
    enum: ['PROMOCIONAL', 'TROCA', 'FRETE', 'CASHBACK'],
    default: 'PROMOCIONAL'
  })
  tipo: string;

  @Column({ nullable: true })
  descricao?: string;

  // Relacionamentos
  @ManyToOne(() => Cliente, { nullable: true })
  cliente?: Cliente;

  @OneToOne(() => Troca, { nullable: true })
  @JoinColumn()
  trocaOrigem?: Troca;

  @ManyToOne(() => Venda, { nullable: true })
  vendaUtilizado?: Venda;

  // Novos campos para regras de uso
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorMinimoCompra?: number;

  @Column({ type: 'boolean', default: false })
  ativo: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
      this.codigo = this.gerarCodigoCupom();
    }
  }

  private gerarCodigoCupom(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}