import logger from '../config/logger.js';

export default function requestLogger(req, res, next) {
  const requestLogger = logger.child({
    requestId: Math.random().toString(36).substring(2, 15),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  req.logger = requestLogger;
  requestLogger.info('Request received');

  res.on('finish', () => {
    requestLogger.info('Response sent', {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
    });
  });

  next();
}
