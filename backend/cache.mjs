// cache.js
import { createCache } from '@voilajs/appkit/cache';

const cache = await createCache({
  strategy: 'memory',
  defaultTTL: 60 * 60,
  keyPrefix: 'restaurant:',
});

export default cache;
