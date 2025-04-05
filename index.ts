import dotenv from "dotenv";
import { createBot } from "./src/bot";

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
    console.log("bot successfully made");
  } catch (error) {
    console.log("Failed to create bot: %d", error);
  }
}

bootstrap();
