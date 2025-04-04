//We're going to make a command handler
//In the command handler, we're going to take a command, and execute whatever the command tells us to do
//We need a command type is what contains the handler
//We need a register function will take in the command, and the handler function, and some optional options
//We need permissions just to see if they're the broadcaster, mod, sub, vip, etc, or specific users
//Getters


export interface CommandOptions {
    description?: string;
    requiredPermissions?: Permission[];
    approvedUsers?: string[];
    notifyDenial?: boolean;
    usage?: string;
    timeLimit?: number;

}

export interface Command {
    handler: CommandHandler;
    options: CommandOptions;
}

export type Permission = 'broadcaster' | 'moderator' | 'subscriber'
/**
 *Command handler class for managing chat commands 
 * 
 */
export class CommandHandler {
    private commands: Map<string, Command>

    /**
     * Create a new command handler
     */
    constructor() {
        this.commands = new Map();
    }

    /**
     * Register a new command
     * @param commandName - Command name (without prefix)
     * @returns success status
     */
    register(commandName: string, handler: CommandHandler, options: CommandOptions) {

        if (this.commands.get(commandName) !== undefined) {
            //TODO: log this1
            return false
        }

        if (typeof handler !== "function") {
            return false
        }

        this.commands.set(commandName, {
            handler,
            options: {
                description: options.description || "no description",
                //TODO: add functionality to create specific permissions as a default
                requiredPermissions: options.requiredPermissions || ["broadcaster"],
                approvedUsers: options.approvedUsers || [],
                notifyDenial: options.notifyDenial || false,
                usage: options.usage || "",
                timeLimit: options.timeLimit || -1
            }
        })

        return true;
    }


}
