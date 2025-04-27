import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { v4 as uuid } from "uuid";
import { Endereco } from "./Endereco";
import { CartaoCredito } from "./CartaoCredito";
import { Venda } from "./Venda";
import { Carrinho } from "./Carrinho";

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string; // RNF0035 (código único)

  @Column()
  nome: string; // RN0026

  @Column({ unique: true })
  email: string; // RN0026

  @Column({ select: false })
  senha: string; // RNF0033 (criptografada)

  @Column({ unique: true })
  cpf: string; // RN0026

  @Column()
  telefone: string; // RN0026

  @Column({ type: 'date' })
  dataNascimento: Date; // RN0026

  @Column({ type: 'enum', enum: ['MASCULINO', 'FEMININO', 'OUTRO'] })
  genero: string; // RN0026

  @Column({ type: 'smallint', default: 1 })
  ranking: number; // RN0027

  @Column({ default: true })
  ativo: boolean; // RF0023

  // Relacionamentos
  @OneToMany(() => Endereco, endereco => endereco.cliente, { cascade: true })
  enderecos: Endereco[]; // RF0026, RN0021-0023

  @OneToMany(() => CartaoCredito, cartao => cartao.cliente, { cascade: true })
  cartoes: CartaoCredito[]; // RF0027, RN0024-0025

  @OneToMany(() => Venda, venda => venda.cliente)
  vendas: Venda[]; // RF0025

  @OneToMany(() => Carrinho, carrinho => carrinho.cliente)
  carrinhos: Carrinho[]; // RF0026, RF0028, RN0023-0024

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