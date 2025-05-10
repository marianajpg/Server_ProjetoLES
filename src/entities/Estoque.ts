import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { Livro } from "./Livros";
import { Fornecedor } from "./Fornecedor";

@Entity('estoque')
export class Estoque {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  quantidade: number; // RN0061 (não pode ser zero)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  custoUnitario: number; // RN0062

  @Column({ type: 'date' })
  dataEntrada: Date; // RN0064

  @Column({ nullable: true })
  notaFiscal?: string;

  // Relacionamentos
  @ManyToOne(() => Livro, livro => livro.estoque)
  @JoinColumn({ name: 'livro_id' })
  livroId: Livro;

  @ManyToOne(() => Fornecedor)
  fornecedor: Fornecedor; // RN0051

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