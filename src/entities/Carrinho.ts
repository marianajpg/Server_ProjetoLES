import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,OneToMany,ManyToOne,Unique, UpdateDateColumn,
  } from "typeorm";
  import { Cliente } from "./Cliente";
  import { ItemCarrinho } from "./ItemCarrinho";
  import { v4 as uuid } from "uuid";
import { Cupom } from "./Cupom";
  
  @Entity()
  @Unique(["cliente", "ativo"])
  export class Carrinho {
    @PrimaryGeneratedColumn("uuid")
    id!: string;
  
    @ManyToOne(() => Cliente, (cliente) => cliente.carrinhos, { nullable: false })
    cliente: Cliente;
  
    @OneToMany(() => ItemCarrinho, (item) => item.carrinho, {
      cascade: true,
      eager: true,
    })
    itens: ItemCarrinho[];
  
    @Column({ default: true })
    ativo: boolean;

     @ManyToOne(() => Cupom, { nullable: true })
      cupomAplicado?: Cupom;
    
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
  