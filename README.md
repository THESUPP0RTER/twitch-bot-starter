# Twitch Sentiment Analysis Bot - TypeScript Implementation

## Project Structure

```
twitch-sentiment-bot/
├── src/
│   ├── bot.ts                # Core bot functionality with Twitch connection
│   ├── commands.ts           # Command handling system
│   └── utils/
│       ├── logger.ts         # Logging utility
├── data/                     # Database and other persistent data
├── config.json               # Main configuration file
├── .env                      # Environment variables (credentials)
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
└── index.ts                  # Application entry point
```

## Getting Started with TypeScript Implementation

1. **Setup Project**:
   ```bash
   mkdir twitch-sentiment-bot
   cd twitch-sentiment-bot
   npm init -y
   ```

2. **Install Dependencies**:
   ```bash
   # Core dependencies
   npm install tmi.js sentiment sqlite sqlite3 express cors body-parser winston dotenv

   # TypeScript and development dependencies
   npm install --save-dev typescript ts-node-dev @types/node @types/tmi.js @types/sentiment @types/express @types/cors jest ts-jest @types/jest @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint
   ```

3. **Create Configuration Files**:
   - `tsconfig.json`: TypeScript configuration
   - `.env`: Environment variables (credentials)
   - `config.json`: Application configuration (will be created automatically)

## Development Workflow

1. **Run in Development Mode**:
   ```bash
   npm run dev
   ```

2. **Build for Production**:
   ```bash
   npm run build
   ```

3. **Run in Production Mode**:
   ```bash
   npm start
   ```

## Type Definitions

The TypeScript implementation includes comprehensive type definitions for all components:

- **Bot**: `BotOptions`
- **Commands**: `CommandOptions`, `Command`, `CommandHandlerOptions`, `Permission`

## Configuration

The bot can be configured through both environment variables and a configuration file:

1. **Environment Variables**:
   ```
   # Twitch Bot Configuration
   BOT_USERNAME=your_bot_username
   OAUTH_TOKEN=oauth:your_oauth_token
   CHANNELS=channel1,channel2,channel3

   # Logging
   LOG_LEVEL=info
   ```

2. **Configuration File** (`config.json`):
   The configuration file is automatically created with default values and can be modified manually.

## Chat Commands

| Command | Description | Permissions |
|---------|-------------|------------|
| `!` | Test | broadcaster |

## Extending the Bot

1. **Add New Chat Commands**:
   ```typescript
   bot.registerCommand('mycommand', (client, channel, tags, args) => {
     // Command implementation
     client.say(channel, 'Custom command executed!');
   }, {
     description: 'My custom command',
     usage: '!mycommand [option]',
     requiredPermissions: ['moderator']
   });
   ```
