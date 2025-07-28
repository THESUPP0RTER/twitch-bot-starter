import * as tmi from 'tmi.js';
import { CommandHandler } from '../src/commands';
import { BotInterface } from '../src/bot';

// Mock tmi.js client
const mockSay = jest.fn();
const mockClient = {
  say: mockSay,
} as unknown as tmi.Client;

// Mock bot interface
const mockBot: BotInterface = {
  client: mockClient,
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  registerCommand: jest.fn().mockReturnValue(true),
};

describe('CommandHandler', () => {
  let commandHandler: CommandHandler;

  beforeEach(() => {
    commandHandler = new CommandHandler({
      prefix: '!',
      bot: mockBot,
    });
    mockSay.mockClear();
  });

  describe('constructor', () => {
    it('should create a command handler with the specified prefix', () => {
      expect(commandHandler.options.prefix).toBe('!');
    });

    it('should create a command handler with custom required permissions', () => {
      const handler = new CommandHandler({
        prefix: '!',
        requiredPermissions: ['moderator'],
        bot: mockBot,
      });
      expect(handler.options.requiredPermissions).toEqual(['moderator']);
    });
  });

  describe('register', () => {
    it('should register a command successfully', () => {
      const mockHandler = jest.fn();
      const result = commandHandler.register('test', mockHandler, {
        description: 'Test command',
      });

      expect(result).toBe(true);
    });

    it('should not register a command if it already exists', () => {
      const mockHandler = jest.fn();
      commandHandler.register('test', mockHandler, {});

      const secondResult = commandHandler.register('test', mockHandler, {});
      expect(secondResult).toBe(false);
    });

    it('should not register a command if handler is not a function', () => {
      const result = commandHandler.register(
        'test',
        'not a function' as any,
        {}
      );
      expect(result).toBe(false);
    });

    it('should set default options if not provided', () => {
      const mockHandler = jest.fn();
      commandHandler.register('test', mockHandler, {});

      // Test with processCommand
      const tags = {
        badges: { broadcaster: '1' },
        username: 'testuser',
      } as tmi.ChatUserstate;

      commandHandler.processCommand(mockClient, '#channel', '!test', tags);

      // Verify that the handler was called with a context object
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          bot: mockBot,
          client: mockClient,
          channel: '#channel',
          tags: tags,
          args: [],
        })
      );
    });
  });

  describe('processCommand', () => {
    it('should return false if message does not start with prefix', () => {
      const result = commandHandler.processCommand(
        mockClient,
        '#channel',
        'test',
        {} as tmi.ChatUserstate
      );
      expect(result).toBe(false);
    });

    it('should return false if command does not exist', () => {
      const result = commandHandler.processCommand(
        mockClient,
        '#channel',
        '!nonexistent',
        {} as tmi.ChatUserstate
      );
      expect(result).toBe(false);
      expect(mockSay).toHaveBeenCalledWith('#channel', 'Invalid Command');
    });

    it('should execute the command if it exists and user has permission', () => {
      const mockHandler = jest.fn();
      commandHandler.register('test', mockHandler, {
        requiredPermissions: ['broadcaster'],
      });

      const tags = {
        badges: { broadcaster: '1' },
        username: 'testuser',
      } as tmi.ChatUserstate;

      const result = commandHandler.processCommand(
        mockClient,
        '#channel',
        '!test arg1 arg2',
        tags
      );

      expect(result).toBe(true);

      // Verify context object was passed correctly
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          bot: mockBot,
          client: mockClient,
          channel: '#channel',
          tags: tags,
          args: ['arg1', 'arg2'],
        })
      );
    });

    it('should return false if user lacks permission', () => {
      const mockHandler = jest.fn();
      commandHandler.register('test', mockHandler, {
        requiredPermissions: ['broadcaster'],
      });

      const tags = {
        badges: { subscriber: '1' }, // Not a broadcaster
        username: 'testuser',
      } as tmi.ChatUserstate;

      const result = commandHandler.processCommand(
        mockClient,
        '#channel',
        '!test',
        tags
      );

      expect(result).toBe(false);
      expect(mockSay).toHaveBeenCalledWith('#channel', 'Permission Denied');
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle errors in command execution', () => {
      const mockHandler = jest.fn().mockImplementation(() => {
        throw new Error('Command error');
      });

      commandHandler.register('test', mockHandler, {});

      const tags = {
        badges: { broadcaster: '1' },
        username: 'testuser',
      } as tmi.ChatUserstate;

      const logger = require('../src/utils/logger');
      const loggerSpy = jest.spyOn(logger, 'error').mockImplementation();

      const result = commandHandler.processCommand(
        mockClient,
        '#channel',
        '!test',
        tags
      );

      expect(result).toBe(true);
      expect(loggerSpy).toHaveBeenCalled();
      loggerSpy.mockRestore();
    });
  });

  describe('getCommands', () => {
    it('should return an empty array of commands if there were no registered commands', () => {
      const commands = commandHandler.getCommands();
      expect(commands).toEqual([]);
      expect(commands.length).toBe(0);
    });

    it('should return all registered commands with their details', () => {
      const mockHandler = jest.fn();

      commandHandler.register('test1', mockHandler, {
        description: 'test command 1',
        usage: '!test1 [arg]',
        requiredPermissions: ['broadcaster', 'moderator'],
      });
      commandHandler.register('test2', mockHandler, {
        description: 'test command 2',
        usage: '!test2 [arg]',
      });
      commandHandler.register('test3', mockHandler, {
        requiredPermissions: ['subscriber'],
      });

      //Get all commands
      const commands = commandHandler.getCommands();

      expect(commands.length).toBe(3);

      // Sort the commands by name to ensure consistent order for comparison
      const sortedCommands = [...commands].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      // Verify each command individually
      expect(sortedCommands[0]).toEqual({
        name: 'test1',
        description: 'test command 1',
        usage: '!test1 [arg]',
        permissions: ['broadcaster', 'moderator'],
      });

      expect(sortedCommands[1]).toEqual({
        name: 'test2',
        description: 'test command 2',
        usage: '!test2 [arg]',
        permissions: ['broadcaster'],
      });

      expect(sortedCommands[2]).toEqual({
        name: 'test3',
        description: 'no description',
        usage: '',
        permissions: ['subscriber'],
      });
    });
  });

  describe('checkPermissions', () => {
    it('should return true if no permissions are required', () => {
      const tags = {} as tmi.ChatUserstate;
      expect(commandHandler.checkPermissions(tags, [])).toBe(true);
    });

    it('should return true if user has broadcaster permission', () => {
      const tags = {
        badges: { broadcaster: '1' },
      } as tmi.ChatUserstate;

      expect(commandHandler.checkPermissions(tags, ['broadcaster'])).toBe(true);
    });

    it('should return true if user has moderator permission', () => {
      const tags = {
        badges: { moderator: '1' },
      } as tmi.ChatUserstate;

      expect(commandHandler.checkPermissions(tags, ['moderator'])).toBe(true);
    });

    it('should return true if user has subscriber permission', () => {
      const tags = {
        badges: { subscriber: '1' },
      } as tmi.ChatUserstate;

      expect(commandHandler.checkPermissions(tags, ['subscriber'])).toBe(true);
    });

    it('should return false if user has none of the required permissions', () => {
      const tags = {
        badges: { vip: '1' }, // Not in Permission type
      } as tmi.ChatUserstate;

      expect(
        commandHandler.checkPermissions(tags, ['broadcaster', 'moderator'])
      ).toBe(false);
    });
  });
});
