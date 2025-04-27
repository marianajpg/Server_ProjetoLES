import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { v4 as uuid } from "uuid";
import { Pagamento } from "./Pagamento";
import { VendaItem } from "./VendaItem";
import { Endereco } from "./Endereco";
import { Cliente } from "./Cliente";
import { Troca } from "./Troca";
import { StatusVenda } from './StatusVenda';
import { Cupom } from "./Cupom";

@Entity('vendas')
export class Venda {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ 
    type: 'enum',
    enum: StatusVenda,
    default: StatusVenda.PENDENTE
  })
  status!: StatusVenda;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorFrete?: number; // RF0034

  @Column({ nullable: true })
  codigoRastreio?: string; // RF0038

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataVenda!: Date;

  @Column({ nullable: true })
  dataEntrega?: Date; // RF0039

  // Relacionamentos
  @ManyToOne(() => Cliente, cliente => cliente.vendas)
  cliente!: Cliente;

  @ManyToOne(() => Endereco)
  enderecoEntrega!: Endereco; // RF0035

  @OneToMany(() => VendaItem, item => item.venda, { cascade: true })
  itens!: VendaItem[]; // RF0031-0033

  @OneToMany(() => Pagamento, pagamento => pagamento.venda, { cascade: true })
  pagamentos!: Pagamento[]; // RF0036, RN0034-0035

  @OneToMany(() => Troca, troca => troca.venda)
  trocas: Troca[]; // RF0040-0044

  @ManyToOne(() => Cupom, { nullable: true })
  cupomUtilizado?: Cupom;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descontoAplicado: number;

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