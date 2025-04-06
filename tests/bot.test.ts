import { createBot, BotInterface } from "../src/bot";
import * as tmi from "tmi.js";
import { CommandContext } from "../src/commands";

// Create mock for CommandHandler
const mockProcessCommand = jest.fn();
const mockRegister = jest.fn().mockReturnValue(true);

// Mock the CommandHandler module
jest.mock("../src/commands", () => {
  return {
    CommandHandler: jest.fn().mockImplementation(() => {
      return {
        processCommand: mockProcessCommand,
        register: mockRegister,
        options: { prefix: "!" },
      };
    }),
  };
});

// Mock tmi.js
jest.mock("tmi.js", () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    say: jest.fn(),
  };

  return {
    Client: jest.fn().mockImplementation(() => mockClient),
  };
});

describe("Bot Module", () => {
  let bot: BotInterface;
  let mockTmiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create bot instance with mocks
    bot = createBot({
      identity: {
        username: "test_bot",
        password: "mock_token",
      },
      channels: ["test_channel"],
      commandPrefix: "!",
    });

    mockTmiClient = (tmi.Client as jest.Mock).mock.results[0].value;
  });

  test("should connect to Twitch", async () => {
    await bot.connect();

    // Check if tmi.js connect was called
    expect(tmi.Client).toHaveBeenCalledWith(
      expect.objectContaining({
        identity: {
          username: "test_bot",
          password: "mock_token",
        },
        channels: ["test_channel"],
      }),
    );

    const mockTmiClient = (tmi.Client as jest.Mock).mock.results[0].value;
    expect(mockTmiClient.connect).toHaveBeenCalled();
  });

  test("should disconnect from Twitch", async () => {
    await bot.connect();
    await bot.disconnect();

    const mockTmiClient = (tmi.Client as jest.Mock).mock.results[0].value;
    expect(mockTmiClient.disconnect).toHaveBeenCalled();
  });

  test("should register command", async () => {
    // Create command handler with context pattern
    const handlerFunction = (context: CommandContext) => {};

    // Register command
    const result = bot.registerCommand("testcmd", handlerFunction, {
      description: "Test command",
      requiredPermissions: ["broadcaster"],
    });

    expect(result).toBe(true);
  });

  test("should handle incoming messages and ignore self messages", async () => {
    // Clear mock state before test
    mockProcessCommand.mockClear();

    // Get the message handler registered with the tmi client
    const onHandler = mockTmiClient.on.mock.calls.find(
      (call: any[]) => call[0] === "message",
    );
    expect(onHandler).toBeDefined();

    // Extract the message handler function
    const messageHandler = onHandler[1];

    // Test handling of bot's own message (self = true)
    messageHandler("#channel", { username: "test_bot" }, "!command", true);

    // The command handler's processCommand should not be called for self messages
    expect(mockProcessCommand).not.toHaveBeenCalled();

    // Test handling of user message (self = false)
    const userTags = { username: "user" };
    messageHandler("#channel", userTags, "!command", false);

    // The command handler's processCommand should be called for user messages
    expect(mockProcessCommand).toHaveBeenCalledWith(
      mockTmiClient,
      "#channel",
      "!command",
      userTags,
    );
  });
});
