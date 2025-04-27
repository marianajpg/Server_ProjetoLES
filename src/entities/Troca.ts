import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { v4 as uuid } from "uuid";
import { TrocaItem } from "./TrocaItem";
import { Venda } from "./Venda";

@Entity('trocas')
export class Troca {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['SOLICITADA', 'AUTORIZADA', 'RECEBIDA', 'CONCLUIDA'] })
  status: string; // RF0041-0042

  @Column({ type: 'text' })
  motivo: string; // RF0040

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataSolicitacao: Date;

  @Column({ nullable: true })
  dataAutorizacao?: Date; // RF0041

  @Column({ nullable: true })
  dataRecebimento?: Date; // RF0043

  @Column({ nullable: true })
  codigoCupom?: string; // RF0044

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorCupom?: number; // RN0036

  // Relacionamentos
  @ManyToOne(() => Venda, venda => venda.trocas)
  venda: Venda;

  @OneToMany(() => TrocaItem, item => item.troca, { cascade: true })
  itens: TrocaItem[];

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