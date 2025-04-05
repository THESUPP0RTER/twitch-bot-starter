import * as tmi from "tmi.js";
import { CommandHandler, CommandHandlerFunction } from "./commands";

export interface BotOptions {
  identity: {
    username: string;
    password: string;
  };
  channels: string[];
  debug?: boolean;
  commandPrefix?: string;
}

export interface BotInterface {
  client: tmi.Client;
  connect(): Promise<Boolean>;
  disconnect(): Promise<Boolean>;
  registerCommand(
    commandName: string,
    handler: CommandHandlerFunction,
    options?: any
  ): boolean;
}

/**
 * Create a new Twitch Client
 */

export function createBot(options: BotOptions): BotInterface {
  const client = new tmi.Client({
    identity: options.identity,
    channels: options.channels,
    options: { debug: options.debug },
    connection: {
      secure: true,
      reconnect: true,
    },
  });

  //Make the botInterface - we need this first to pass into the command handler
  const botInterface: BotInterface = {
    client,
    connect: async (): Promise<Boolean> => {
      try {
        await client.connect();
        return true;
      } catch (error) {
        //TODO: Make a logger throw an error
        console.log("Failed to connect to twitch %d", error);
        throw error;
      }
    },

    disconnect: async (): Promise<Boolean> => {
      try {
        await client.disconnect();
        return true;
      } catch (error) {
        //TODO: Make a logger throw an error
        console.log("Failed to disconnect to twitch %d", error);
        throw error;
      }
    },

    registerCommand: (
      commandName: string,
      handlerFunction: CommandHandlerFunction,
      options?: any
    ): boolean => {
      return false; //default value that will be replaced
    },
  };

  const ch = new CommandHandler({
    prefix: options.commandPrefix || "!",
    bot: botInterface,
  });

  botInterface.registerCommand = (
    command: string,
    handlerFunction: CommandHandlerFunction,
    options: any
  ): boolean => {
    return ch.register(command, handlerFunction, options);
  };

  //Handle Incoming messages
  client.on(
    "message",
    (
      channel: string,
      tags: tmi.ChatUserstate,
      message: string,
      self: boolean
    ) => {
      //ignore messages from itself (the bot)
      if (self) return;

      ch.processCommand(client, channel, message, tags);
    }
  );

  return botInterface;
}
