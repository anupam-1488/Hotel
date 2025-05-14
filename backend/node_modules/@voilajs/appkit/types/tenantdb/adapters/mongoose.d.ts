/**
 * Mongoose adapter implementation
 */
export class MongooseAdapter extends BaseAdapter {
    connections: Map<any, any>;
    connect(config: any): Promise<any>;
    mongoose: any;
    createClient(config: any): Promise<any>;
    executeQuery(query: any, params?: any[]): Promise<any>;
    createDatabase(name: any): Promise<void>;
    dropDatabase(name: any): Promise<void>;
    createSchema(name: any): Promise<void>;
    dropSchema(name: any): Promise<void>;
    listDatabases(): Promise<any>;
    listSchemas(): Promise<void>;
    applyTenantMiddleware(connection: any, tenantId: any): any;
    buildDatabaseUrl(dbName: any): string;
    sanitizeName(name: any): any;
}
import { BaseAdapter } from './base.js';
