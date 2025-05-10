// src/config/database.ts
import { createConnection, Connection, Repository, ObjectType, getConnectionManager } from 'typeorm';

let connection: Connection;

export async function initializeDB(): Promise<Connection> {
  const connectionManager = getConnectionManager();
  
  if (connectionManager.has('default')) {
    connection = connectionManager.get('default');
    if (connection.isConnected) {
      return connection;
    }
    return connection.connect();
  }

  connection = await createConnection({
    name: 'default',
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

  return connection;
}

export function getConnection(): Connection {
  const connectionManager = getConnectionManager();
  if (!connectionManager.has('default')) {
    throw new Error('Database not connected. Call initializeDB() first.');
  }
  return connectionManager.get('default');
}

export function getRepository<T>(entity: ObjectType<T>): Repository<T> {
  return getConnection().getRepository(entity);
}