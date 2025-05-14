/**
 * In-memory cache strategy implementation
 * @extends CacheStrategy
 */
export class MemoryStrategy extends CacheStrategy {
    store: Map<any, any>;
    timers: Map<any, any>;
    maxItems: any;
    defaultTTL: any;
    get(key: any): Promise<any>;
    set(key: any, value: any, ttl?: any): Promise<boolean>;
    delete(key: any): Promise<boolean>;
    /**
     * Get cache statistics (Memory-specific)
     * @returns {Object} Cache statistics
     */
    getStats(): any;
}
import { CacheStrategy } from './base.js';
