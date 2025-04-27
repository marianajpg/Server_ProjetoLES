// src/config/database.ts
import { createConnection, Connection, Repository, ObjectType } from 'typeorm';

let connection: Connection;

export async function initializeDB() {
  connection = await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../core/entities/*.ts'],
    synchronize: true,
    logging: false
  });
}

export function getRepository<T>(entity: ObjectType<T>): Repository<T> {
  if (!connection) throw new Error('Database not initialized');
  return connection.getRepository(entity);
}