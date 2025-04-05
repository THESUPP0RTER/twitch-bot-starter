import * as tmi from "tmi.js";
import { CommandHandler } from "../src/commands";

// Mock tmi.js client
const mockSay = jest.fn();
const mockClient = {
  say: mockSay,
} as unknown as tmi.Client;

describe("CommandHandler", () => {
  let commandHandler: CommandHandler;

  beforeEach(() => {
    commandHandler = new CommandHandler({ prefix: "!" });
    mockSay.mockClear();
  });

  describe("constructor", () => {
    it("should create a command handler with the specified prefix", () => {
      expect(commandHandler.options.prefix).toBe("!");
    });

    it("should create a command handler with custom required permissions", () => {
      const handler = new CommandHandler({
        prefix: "!",
        requiredPermissions: ["moderator"],
      });
      expect(handler.options.requiredPermissions).toEqual(["moderator"]);
    });
  });

  describe("registerCommand", () => {
    it("should register a command successfully", () => {
      const mockHandler = jest.fn();
      const result = commandHandler.registerCommand("test", mockHandler, {
        description: "Test command",
      });

      expect(result).toBe(true);
    });

    it("should not register a command if it already exists", () => {
      const mockHandler = jest.fn();
      commandHandler.registerCommand("test", mockHandler, {});

      const secondResult = commandHandler.registerCommand(
        "test",
        mockHandler,
        {}
      );
      expect(secondResult).toBe(false);
    });

    it("should not register a command if handler is not a function", () => {
      const result = commandHandler.registerCommand(
        "test",
        "not a function" as any,
        {}
      );
      expect(result).toBe(false);
    });

    it("should set default options if not provided", () => {
      const mockHandler = jest.fn();
      const result = commandHandler.registerCommand("test", mockHandler, {});

      // We can't directly access private property 'commands', so we'll test through processCommand
      const tags = {
        badges: { broadcaster: "1" },
        username: "testuser",
      } as tmi.ChatUserstate;

      commandHandler.processCommand(mockClient, "#channel", "!test", tags);
      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe("processCommand", () => {
    it("should return false if message does not start with prefix", () => {
      const result = commandHandler.processCommand(
        mockClient,
        "#channel",
        "test",
        {} as tmi.ChatUserstate
      );
      expect(result).toBe(false);
    });

    it("should return false if command does not exist", () => {
      const result = commandHandler.processCommand(
        mockClient,
        "#channel",
        "!nonexistent",
        {} as tmi.ChatUserstate
      );
      expect(result).toBe(false);
      expect(mockSay).toHaveBeenCalledWith("#channel", "Invalid Command");
    });

    it("should execute the command if it exists and user has permission", () => {
      const mockHandler = jest.fn();
      commandHandler.registerCommand("test", mockHandler, {
        requiredPermissions: ["broadcaster"],
      });

      const tags = {
        badges: { broadcaster: "1" },
        username: "testuser",
      } as tmi.ChatUserstate;

      const result = commandHandler.processCommand(
        mockClient,
        "#channel",
        "!test arg1 arg2",
        tags
      );

      expect(result).toBe(true);
      expect(mockHandler).toHaveBeenCalledWith(mockClient, "#channel", tags, [
        "arg1",
        "arg2",
      ]);
    });

    it("should return false if user lacks permission", () => {
      const mockHandler = jest.fn();
      commandHandler.registerCommand("test", mockHandler, {
        requiredPermissions: ["broadcaster"],
      });

      const tags = {
        badges: { subscriber: "1" }, // Not a broadcaster
        username: "testuser",
      } as tmi.ChatUserstate;

      const result = commandHandler.processCommand(
        mockClient,
        "#channel",
        "!test",
        tags
      );

      expect(result).toBe(false);
      expect(mockSay).toHaveBeenCalledWith("#channel", "Permission Denied");
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should handle errors in command execution", () => {
      const mockHandler = jest.fn().mockImplementation(() => {
        throw new Error("Command error");
      });

      commandHandler.registerCommand("test", mockHandler, {});

      const tags = {
        badges: { broadcaster: "1" },
        username: "testuser",
      } as tmi.ChatUserstate;

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const result = commandHandler.processCommand(
        mockClient,
        "#channel",
        "!test",
        tags
      );

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("checkPermissions", () => {
    it("should return true if no permissions are required", () => {
      const tags = {} as tmi.ChatUserstate;
      expect(commandHandler.checkPermissions(tags, [])).toBe(true);
    });

    it("should return true if user has broadcaster permission", () => {
      const tags = {
        badges: { broadcaster: "1" },
      } as tmi.ChatUserstate;

      expect(commandHandler.checkPermissions(tags, ["broadcaster"])).toBe(true);
    });

    it("should return true if user has moderator permission", () => {
      const tags = {
        badges: { moderator: "1" },
      } as tmi.ChatUserstate;

      expect(commandHandler.checkPermissions(tags, ["moderator"])).toBe(true);
    });

    it("should return true if user has subscriber permission", () => {
      const tags = {
        badges: { subscriber: "1" },
      } as tmi.ChatUserstate;

      expect(commandHandler.checkPermissions(tags, ["subscriber"])).toBe(true);
    });

    it("should return false if user has none of the required permissions", () => {
      const tags = {
        badges: { vip: "1" }, // Not in Permission type
      } as tmi.ChatUserstate;

      expect(
        commandHandler.checkPermissions(tags, ["broadcaster", "moderator"])
      ).toBe(false);
    });
  });
});
