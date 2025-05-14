/**
 * Memcached cache strategy implementation
 * @extends CacheStrategy
 */
export class MemcachedStrategy extends CacheStrategy {
    client: any;
    serializer: any;
    defaultTTL: any;
    get(key: any): Promise<any>;
    set(key: any, value: any, ttl?: any): Promise<boolean>;
    delete(key: any): Promise<boolean>;
    /**
     * Promisify a memcached method
     * @private
     */
    private promisify;
}
import { CacheStrategy } from './base.js';
