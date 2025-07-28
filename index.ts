import dotenv from 'dotenv';
import { createBot } from './src/bot';
import { connect, StringCodec } from 'nats';

const winston = require('winston');
const logger = require('./src/utils/logger');

dotenv.config();

async function bootstrap() {
  try {
    const bot = createBot({
      identity: {
        username: process.env.USERNAME || '',
        password: process.env.ACCESS_CODE || '',
      },
      channels: ['xreciprocated'],
      debug: true,
    });

    await bot.connect();
    logger.info('bot successfully made');

    const nc = await connect();
    logger.info('Connected to NATS');

    const sc = StringCodec();
    const subject = 'twitch.messages';

    nc.publish(subject, sc.encode('Hello NATS!'));
    await nc.flush();
    await nc.close();
  } catch (error) {
    logger.error('Failed to create bot: %s', error);
  }
}

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `

// Not sure if this is the best place for this, but it'll work for now
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

bootstrap();
