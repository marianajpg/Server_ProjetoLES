
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { v4 as uuid } from "uuid";
import { VendaItem } from "./VendaItem";
import { Estoque } from "./Estoque";
import { Categoria } from "./Categoria";
import { Editora } from "./Editora";
import { Autor } from "./Autor";
import { GrupoPrecificacao } from "./GrupoPrecificacao";
import { ImagemLivro } from "./ImagemLivro";

export enum CategoriaInativacao {
  FORA_DE_MERCADO = 'FORA_DE_MERCADO',
  OBSOLETO = 'OBSOLETO',
  OUTROS = 'OUTROS'
} 


@Entity('livros')
export class Livro {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string; // RNF0021 (código único)

  @Column({ unique: true })
  isbn: string; // RN0011

  @Column()
  titulo: string; // RN0011

  @Column({ type: 'smallint' })
  ano: number; // RN0011

  @Column({ type: 'smallint' })
  edicao: number; // RN0011

  @Column({ type: 'smallint' })
  paginas: number; // RN0011

  @Column({ type: 'text' })
  sinopse: string; // RN0011

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  altura: number; // RN0011 (dimensões)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  largura: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  profundidade: number;

  @Column({ unique: true })
  codigoBarras: string; // RN0011

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorVenda: number; // RN0013-0014

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorCusto: number; // RN0013-0014

  @Column({ default: true })
  ativo: boolean; // RF0012, RF0016

  @Column({ nullable: true })
  dataInativacao?: Date; // RF0012

  @Column({ nullable: true, type: 'text' })
  justificativaInativacao?: string; // RN0015, RN0017

  @Column({ nullable: true })
  categoriaInativacao?: CategoriaInativacao

  // Relacionamentos
  @ManyToOne(() => GrupoPrecificacao)
  grupoPrecificacao: GrupoPrecificacao; // RN0013

  @ManyToOne(() => Autor)
  autor: Autor; // RN0011

  @ManyToOne(() => Editora)
  editora: Editora; // RN0011

  @ManyToMany(() => Categoria)
  @JoinTable({
    name: 'livro_categoria', // Nome da tabela de junção
    joinColumn: {
      name: 'livro_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'categoria_id',
      referencedColumnName: 'id'
    }
  })
  categorias: Categoria[]; // RN0012

  @OneToMany(() => Estoque, estoque => estoque.livroId)
  estoque: Estoque[];

  @OneToMany(() => VendaItem, vendaItem => vendaItem.livro)
  itensVenda: VendaItem[];

  @OneToMany(() => ImagemLivro, imagem => imagem.livro)
imagens: ImagemLivro[];

  

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