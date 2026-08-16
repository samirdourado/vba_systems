import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  async getHealth() {
    let isDbConnected = false;

    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');
        isDbConnected = true;
      }
    } catch {
      isDbConnected = false;
    }

    return {
      name: 'baas-backend',
      status: isDbConnected ? 'ok' : 'degraded',
      description: 'Ambiente de simulação para testes VBA Systems — Desenvolvido por Samir Dourado',
      docs: '/docs',
      database: isDbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}