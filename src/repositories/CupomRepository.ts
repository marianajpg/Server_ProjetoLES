import { EntityRepository, Repository, getRepository } from "typeorm";
import { Cupom } from "../entities/Cupom";
import { Cliente } from "../entities/Cliente";

import { MoreThanOrEqual } from 'typeorm';


@EntityRepository(Cupom)
class CupomRepository extends Repository<Cupom> {
  // Métodos básicos de CRUD
  async findAll(relations: string[] = []): Promise<Cupom[]> {
    return this.find({ relations });
  }

  async findById(id: string, relations: string[] = []): Promise<Cupom | null> {
    return this.findOne({ where: { id }, relations });
  }

  async findByCodigo(codigo: string, relations: string[] = []): Promise<Cupom | null> {
    return this.findOne({ where: { codigo }, relations });
  }

  async createAndSave(cupom: Cupom): Promise<Cupom> {
    return this.save(cupom);
  }

  async updateAndSave(cupom: Cupom): Promise<Cupom> {
    return this.save(cupom);
  }

  // Métodos específicos para regras de negócio
  async marcarComoUtilizado(id: string): Promise<void> {
    await this.update(id, { utilizado: true });
  }

  // Consulta com filtros definidos pelo usuário
  async findByFilters(filters: {
    codigo?: string;
    clienteId?: string;
    tipo?: 'PROMOCIONAL' | 'TROCA';
    utilizado?: boolean;
    validoApos?: Date;
    valorMin?: number;
    valorMax?: number;
  }): Promise<Cupom[]> {
    const query = this.createQueryBuilder("cupom");

    if (filters.codigo) {
      query.andWhere("cupom.codigo ILIKE :codigo", { codigo: `%${filters.codigo}%` });
    }

    if (filters.clienteId) {
      query.andWhere("cupom.clienteId = :clienteId", { clienteId: filters.clienteId });
    }

    if (filters.tipo) {
      query.andWhere("cupom.tipo = :tipo", { tipo: filters.tipo });
    }

    if (filters.utilizado !== undefined) {
      query.andWhere("cupom.utilizado = :utilizado", { utilizado: filters.utilizado });
    }

    if (filters.validoApos) {
      query.andWhere("cupom.validade >= :validoApos", { validoApos: filters.validoApos });
    }

    if (filters.valorMin !== undefined) {
      query.andWhere("cupom.valor >= :valorMin", { valorMin: filters.valorMin });
    }

    if (filters.valorMax !== undefined) {
      query.andWhere("cupom.valor <= :valorMax", { valorMax: filters.valorMax });
    }

    return query.getMany();
  }

  // Validar cupom para uso em uma venda (RN0033, RN0035, RN0036, RN0037)
  async validarCupomParaVenda(codigo: string, clienteId: string, valorTotalVenda: number): Promise<{ valido: boolean; cupom?: Cupom; mensagem?: string }> {
    const cupom = await this.findOne({ 
      where: { codigo, cliente: { id: clienteId } },
      relations: ['cliente']
    });

    if (!cupom) {
      return { valido: false, mensagem: 'Cupom não encontrado' };
    }

    if (cupom.utilizado) {
      return { valido: false, mensagem: 'Cupom já utilizado' };
    }

    const hoje = new Date();
    if (cupom.validade < hoje) {
      return { valido: false, mensagem: 'Cupom expirado' };
    }

    // Verifica se o valor do cupom é maior que o valor da compra (RN0036)
    if (cupom.valor > valorTotalVenda) {
      return { 
        valido: true, 
        cupom, 
        mensagem: 'Cupom válido - será gerado cupom de troca para a diferença' 
      };
    }

    // Verifica se o valor restante após aplicar o cupom atende ao mínimo de R$10 no cartão (RN0035)
    const valorRestante = valorTotalVenda - cupom.valor;
    if (valorRestante > 0 && valorRestante < 10) {
      return { 
        valido: false, 
        mensagem: 'O valor restante após aplicar o cupom deve ser no mínimo R$ 10,00 quando pago com cartão' 
      };
    }

    return { valido: true, cupom };
  }

// Gerar cupom de troca (RF0044, RN0036)
async gerarCupomTroca(
    cliente: Cliente,
    valor: number,
    motivo: string
  ): Promise<Cupom> {
    const cupom = new Cupom();
    
    // Gera um código alfanumérico de 8 caracteres
    cupom.codigo = 'TROCA-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    cupom.valor = valor;
    cupom.cliente = cliente;
    cupom.tipo = 'TROCA';
    cupom.utilizado = false;
    
    // Define validade para 30 dias a partir de hoje
    const validade = new Date();
    validade.setDate(validade.getDate() + 30);
    cupom.validade = validade;
  
    return this.save(cupom);
  }
  
  // Método auxiliar para gerar código único do cupom
  private gerarCodigoCupom(): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 8; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  }

  // Buscar cupons válidos de um cliente (não utilizados e dentro da validade)
  async findCuponsValidosByCliente(clienteId: string): Promise<Cupom[]> {
    const hoje = new Date();
    return this.find({
      where: {
        cliente: { id: clienteId },
        utilizado: false,
        validade: MoreThanOrEqual(hoje)
      },
      order: { validade: 'ASC' }
    });
  }
}

export { CupomRepository };