//We're going to make a command handler
//In the command handler, we're going to take a command, and execute whatever the command tells us to do
//We need a command type is what contains the handler
//We need a register function will take in the command, and the handler function, and some optional options
//We need permissions just to see if they're the broadcaster, mod, sub, vip, etc, or specific users
//Getters

import * as tmi from "tmi.js";
import { BotInterface } from "./bot";
const logger = require("./utils/logger");

export interface CommandContext {
  bot: BotInterface;
  client: tmi.Client;
  channel: string;
  tags: tmi.ChatUserstate;
  args: string[];
}

export interface CommandOptions {
  description?: string;
  requiredPermissions?: Permission[];
  approvedUsers?: string[];
  notifyDenial?: boolean;
  usage?: string;
  timeLimit?: number;
}

export type CommandHandlerFunction = (context: CommandContext) => void;

export interface CommandHandlerOptions {
  prefix: string;
  requiredPermissions?: Permission[];
  bot: BotInterface;
}

export interface Command {
  commandFunction: CommandHandlerFunction;
  options: CommandOptions;
}

export type Permission = "broadcaster" | "moderator" | "subscriber";
/**
 *Command handler class for managing chat commands
 *
 */
export class CommandHandler {
  private commands: Map<string, Command>;
  public options: CommandHandlerOptions;

  /**
   * Create a new command handler
   */
  constructor(options: CommandHandlerOptions) {
    this.commands = new Map();
    this.options = {
      prefix: options.prefix,
      requiredPermissions: options.requiredPermissions,
      bot: options.bot,
    };
    //TODO: default required Permissions
  }

  /**
   * Register a new command
   * @param commandName - Command name (without prefix)
   * @param handler - Command handler function
   * @param options - Command options
   * @returns success status
   */
  register(
    commandName: string,
    commandFunction: CommandHandlerFunction,
    options: CommandOptions,
  ): boolean {
    if (this.commands.get(commandName) !== undefined) {
      //TODO: utilize logger
      console.log("Cannot be an existing command");
      return false;
    }

    if (typeof commandFunction !== "function") {
      console.log("Handler function needs to be a function");
      return false;
    }

    this.commands.set(commandName.toLowerCase(), {
      commandFunction,
      options: {
        description: options.description || "no description",
        //TODO: add functionality to create specific permissions as a default
        requiredPermissions: options.requiredPermissions || ["broadcaster"],
        approvedUsers: options.approvedUsers || [],
        notifyDenial: options.notifyDenial || false,
        usage: options.usage || "",
        timeLimit: options.timeLimit || -1,
      },
    });
    return true;
  }

  /**
   * Register a new command
   * @param client - tmi client
   * @param channel - the channel the bot will run the command in
   * @param message - the chat message that called the command
   * @param tags - the chatters tags which determine permissions
   * @returns success status
   */
  processCommand(
    client: tmi.Client,
    channel: string,
    message: string,
    tags: tmi.ChatUserstate,
  ): boolean {
    if (!message.startsWith(this.options.prefix)) {
      return false;
    }

    // extract command and arguments
    const partsOfCommand = message
      .slice(this.options.prefix.length)
      .split(/\s+/);
    const commandName = partsOfCommand[0].toLowerCase(); // command name is only the first element
    const args = partsOfCommand.slice(1);

    if (!this.commands.has(commandName)) {
      client.say(channel, "Invalid Command");
      return false;
    }

    if (
      !this.checkPermissions(
        tags,
        this.options.requiredPermissions || ["broadcaster"],
      )
    ) {
      client.say(channel, "Permission Denied");
      return false;
    }

    const command = this.commands.get(commandName); // retrieves command (includes handler and options)
    if (command === undefined) return false;

    try {
      const context: CommandContext = {
        bot: this.options.bot,
        client: client,
        channel: channel,
        tags: tags,
        args: args,
      };

      command.commandFunction(context);
      return true;
    } catch (error) {
      console.log(
        "An error occurred while executing the command: %s",
        String(error),
      );
      return true;
    }
  }

  checkPermissions(
    tags: tmi.ChatUserstate,
    requiredPermissions: Permission[],
  ): boolean {
    if (!requiredPermissions || requiredPermissions.length == 0) {
      // checks if requiredPermissions exists or if it has no requirements
      return true;
    }
    return requiredPermissions.some((permission) => {
      switch (permission) {
        case "broadcaster":
          return tags.badges?.broadcaster;
        case "moderator":
          return tags.badges?.moderator;
        case "subscriber":
          return tags.badges?.subscriber;
        default:
          return false;
      }
    });
  }

  /**
   * Get all registered commands
   * @returns Array of commands
   */
  getCommands(): Array<{
    name: string;
    description: string;
    usage: string;
    permissions: Permission[];
  }> {
    const commands: Array<{
      name: string;
      description: string;
      usage: string;
      permissions: Permission[];
    }> = [];

    this.commands.forEach((command, name) => {
      commands.push({
        name,
        description: command.options.description || "",
        usage: command.options.usage || "",
        permissions: command.options.requiredPermissions || [],
      });
    });

    return commands;
  }
}
