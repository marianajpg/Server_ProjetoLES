import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { v4 as uuid } from "uuid";

@Entity('logs_transacoes')
export class LogTransacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entidade: string; // Nome da entidade alterada

  @Column()
  entidadeId: string; // ID da entidade alterada

  @Column({ type: 'enum', enum: ['CRIACAO', 'ATUALIZACAO', 'REMOCAO'] })
  tipoOperacao: string;

  @Column({ type: 'jsonb', nullable: true })
  dadosAntigos?: any;

  @Column({ type: 'jsonb', nullable: true })
  dadosNovos?: any;

  @Column()
  usuarioId: string; // ID do usuário que realizou a operação

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataHora: Date;
  
  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}