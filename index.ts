import dotenv from "dotenv";
import { createBot } from "./src/bot";
import { connect, StringCodec } from "nats";

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

    const nc = await connect();
    console.log('Connected to NATS');

    const sc = StringCodec();
    const subject = "twitch.messages";

    nc.publish(subject, sc.encode("Hello NATS!"));
    await nc.flush(); // <<< Add this line to ensure message is sent    
    await nc.close();

  } catch (error) {
    console.log("Failed to create bot: %d", error);
  }
}

bootstrap();
