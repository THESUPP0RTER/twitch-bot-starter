import { createBot, BotInterface } from '../src/bot';
import * as tmi from 'tmi.js';

// Mock tmi.js
jest.mock('tmi.js', () => {
    const mockClient = {
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
        say: jest.fn()
    };

    return {
        Client: jest.fn().mockImplementation(() => mockClient)
    };
});

describe('Bot Module', () => {
    let bot: BotInterface;

    beforeEach(() => {
        jest.clearAllMocks();

        // Create bot instance with mocks
        bot = createBot({
            identity: {
                username: 'test_bot',
                password: 'mock_token'
            },
            channels: ['test_channel'],
            commandPrefix: '!'
        });
    });

    test('should connect to Twitch', async () => {
        await bot.connect();

        // Check if tmi.js connect was called
        expect(tmi.Client).toHaveBeenCalledWith(expect.objectContaining({
            identity: {
                username: 'test_bot',
                password: 'mock_token'
            },
            channels: ['test_channel']
        }));

        const mockTmiClient = (tmi.Client as jest.Mock).mock.results[0].value;
        expect(mockTmiClient.connect).toHaveBeenCalled();
    });

    test('should disconnect from Twitch', async () => {
        await bot.connect();
        await bot.disconnect();

        const mockTmiClient = (tmi.Client as jest.Mock).mock.results[0].value;
        expect(mockTmiClient.disconnect).toHaveBeenCalled();
    });

    test('should register command', async () => {
        // Create command handler
        const handlerFunction = (client: tmi.Client, channel: string, tags: tmi.ChatUserstate, args: string[]) => { }
        // Register command
        const result = bot.registerCommand('testcmd', handlerFunction, {
            description: 'Test command',
            requiredPermissions: ['broadcaster']
        });

        expect(result).toBe(true);
    });
});