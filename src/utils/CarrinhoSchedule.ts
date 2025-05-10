import { CronJob } from 'cron';
import { LessThan, Between, Repository } from 'typeorm';
import { CarrinhoService } from '../services/CarrinhoService';
import { Carrinho } from '../entities/Carrinho';
import { EstoqueService } from '../services/EstoqueService';
import { getRepository, getConnection } from '../config/database';
import { Logger } from '@nestjs/common';

export class CartScheduler {
    private readonly logger = new Logger(CartScheduler.name);
    private carrinhoRepository: Repository<Carrinho>;
    
    constructor(
        private readonly carrinhoService: CarrinhoService,
        private readonly estoqueService: EstoqueService
    ) {
        this.initializeRepository();
    }

    private async initializeRepository() {
        this.carrinhoRepository = await getRepository(Carrinho);
    }

    async init() {
        await this.initializeRepository();
        this.scheduleExpiredCartCleanup();
        this.scheduleExpirationNotifications();
    }

    private scheduleExpiredCartCleanup() {
        const job = new CronJob('0 * * * * *', async () => {
            this.logger.log('Verificando carrinhos expirados...');
            await this.handleExpiredCarts();
        });

        job.start();
        this.logger.log('Agendador de carrinhos expirados iniciado');
    }

    private scheduleExpirationNotifications() {
        const job = new CronJob('0 * * * * *', async () => {
            this.logger.log('Verificando itens prestes a expirar...');
            await this.notifyAboutToExpireItems();
        });

        job.start();
        this.logger.log('Agendador de notificações de expiração iniciado');
    }

    private async handleExpiredCarts() {
        const dezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000);
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const carrinhosExpirados = await this.carrinhoRepository.find({
                where: {
                    status: 'pendente',
                    created_at: LessThan(dezMinutosAtras),
                },
                relations: ['itens'],
            });

            for (const carrinho of carrinhosExpirados) {
                try {
                    await this.processExpiredCart(carrinho, queryRunner);
                    this.logger.log(`Carrinho ${carrinho.id} expirado e estoque liberado`);
                } catch (error) {
                    this.logger.error(`Erro ao processar carrinho ${carrinho.id}:`, error);
                }
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Erro ao buscar carrinhos expirados:', error);
        } finally {
            await queryRunner.release();
        }
    }

    private async processExpiredCart(carrinho: Carrinho, queryRunner: any) {
        await Promise.all(
            carrinho.itens.map(item => 
                this.estoqueService.liberarReservaEstoque(item.livro.id, item.quantidade)
            )
        );

        carrinho.status = 'expirado';
        await queryRunner.manager.save(Carrinho, carrinho);
    }

    private async notifyAboutToExpireItems() {
        const noveMinutosAtras = new Date(Date.now() - 9 * 60 * 1000);
        const dezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000);

        try {
            const quaseExpirando = await this.carrinhoRepository.find({
                where: {
                    status: 'pendente',
                    created_at: Between(noveMinutosAtras, dezMinutosAtras),
                },
                relations: ['cliente', 'itens'],
            });

            for (const carrinho of quaseExpirando) {
                try {
                    this.logger.log(`Alerta: Carrinho ${carrinho.id} está prestes a expirar`);
                    // Implemente a notificação real ao cliente aqui
                } catch (error) {
                    this.logger.error(`Erro ao notificar carrinho ${carrinho.id}:`, error);
                }
            }
        } catch (error) {
            this.logger.error('Erro ao buscar carrinhos prestes a expirar:', error);
        }
    }
}