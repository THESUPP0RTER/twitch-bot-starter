import dotenv from "dotenv";
import { createBot } from "./src/bot";

const logger = require('./src/utils/logger')


dotenv.config();

async function bootstrap() {
  try {
    const bot = createBot({
      identity: {
        username: process.env.USERNAME || "",
        password: process.env.ACCESS_CODE || "",
      },
      channels: ["xreciprocated"],
      debug: true,
    });

        await bot.connect();
        console.log("bot successfully made")
        logger.log('info', "Bot Created")
    } catch (error) {
        console.log("Failed to create bot: %d", error);
        logger.log('error', "Failed to create bot")
    }

}

bootstrap();
