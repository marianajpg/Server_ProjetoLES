import {Entity,PrimaryGeneratedColumn,ManyToOne,Column, UpdateDateColumn, CreateDateColumn,
  } from "typeorm";
  import { Carrinho } from "./Carrinho";
  import { Livro } from "./Livros";
  import { v4 as uuid } from "uuid";
  
  @Entity()
  export class ItemCarrinho {
    @PrimaryGeneratedColumn("uuid")
    id!: string;
  
    @ManyToOne(() => Carrinho, (carrinho) => carrinho.itens, { onDelete: "CASCADE" })
    carrinho: Carrinho;
  
    @ManyToOne(() => Livro, { eager: true })
    livro: Livro;
  
    @Column()
    quantidade: number;

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
  