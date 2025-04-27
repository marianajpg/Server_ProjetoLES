import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { v4 as uuid } from "uuid";
import { Venda } from "./Venda";

@Entity('pagamentos')
export class Pagamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['CARTAO_CREDITO', 'CUPOM'] })
  tipo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @Column({ nullable: true })
  cartaoId?: string; // Referência ao cartão usado

  @Column({ nullable: true })
  cupomId?: string; // RN0033

  @Column({ type: 'enum', enum: ['PENDENTE', 'APROVADO', 'REPROVADO'], default: 'PENDENTE' })
  status: string; // RN0038

  // Relacionamentos
  @ManyToOne(() => Venda, venda => venda.pagamentos)
  venda: Venda;

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