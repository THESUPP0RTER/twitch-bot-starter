import * as tmi from 'tmi.js'

export interface BotOptions {
    username: string;
    password: string;
    channels: string[];
    debug?: boolean;
    commandPrefix?: string;
}


export interface BotInterface {
    client: tmi.Client,
    connect(): Promise<Boolean>
    disconnect(): Promise<Boolean>
    registerCommand(): boolean
}

/**
 * Create a new Twitch Client
 */

export function createBot(options: BotOptions): BotInterface {
    const client = new tmi.Client({
        identity: {
            username: options.username,
            password: options.password
        },
        channels: options.channels,
        options: { debug: options.debug }
    });


    client.on('message', (channel: string, tags: tmi.ChatUserstate, message: string, self: boolean) => {
        //ignore messages from itself (the bot)
        if (self) return;

        if (message.startsWith(options.commandPrefix || "!")) {
            //TODO: Handle commands, use a command handler
            client.say(channel, `@${tags.username}, heya!`);
        }


    })

    const botInterface: BotInterface = {
        client,
        connect: async (): Promise<Boolean> => {
            //Potential bug, if connection doesn't work, then it's probably here
            try {
                await client.connect()
                return true
            } catch (error) {
                //TODO: Make a logger throw an error
                return error
            }
        },

        disconnect: async (): Promise<Boolean> => {
            //Potential bug, if connection doesn't work, then it's probably here
            try {
                await client.disconnect()
                return true
            } catch (error) {
                //TODO: Make a logger throw an error
                return error
            }
        },

        registerCommand(command: string,) {

        },
    }
    return botInterface;
}