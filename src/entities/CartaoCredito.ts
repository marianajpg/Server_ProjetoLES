import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { v4 as uuid } from "uuid";
import { Cliente } from "./Cliente";

@Entity('cartoes_credito')
export class CartaoCredito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  numero: string; // Armazenar apenas os últimos 4 dígitos na prática

  @Column()
  nomeTitular: string;

  @Column({ type: 'enum', enum: ['VISA', 'MASTERCARD', 'ELO', 'AMEX'] })
  bandeira: string; // RN0025

  @Column({ length: 3 })
  codigoSeguranca: string;

  @Column({ length: 7 })
  validade: string; // Formato MM/YYYY

  @Column({ default: false })
  preferencial: boolean; // RF0027

  // Relacionamentos
  @ManyToOne(() => Cliente, cliente => cliente.cartoes)
  cliente: Cliente;

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