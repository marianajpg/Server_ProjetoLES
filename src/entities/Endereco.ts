import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { Cliente } from "./Cliente";

@Entity('enderecos')
export class Endereco {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['RESIDENCIAL', 'COMERCIAL', 'OUTRO'] })
  tipo: string;

  @Column({ type: 'enum', enum: ['COBRANCA', 'ENTREGA'] })
  tipoEndereco: string; // RN0021-0022

  @Column()
  logradouro: string;

  @Column()
  numero: string;

  @Column({ nullable: true })
  complemento?: string;

  @Column()
  bairro: string;

  @Column({ length: 8 })
  cep: string;

  @Column()
  cidade: string;

  @Column({ length: 2 })
  estado: string;

  @Column({ default: 'Brasil' })
  pais: string;

  @Column({ nullable: true })
  observacoes?: string;

  // Relacionamentos
  @ManyToOne(() => Cliente, cliente => cliente.enderecos)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;
  
  constructor() {
    if (!this.id) {
        this.id = uuid();
    }
  }
}