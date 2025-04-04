# Twitch Sentiment Analysis Bot - TypeScript Implementation

## Project Structure

```
twitch-sentiment-bot/
├── src/
│   ├── bot.ts                # Core bot functionality with Twitch connection
│   ├── analytics.ts          # Sentiment analysis engine
│   ├── database.ts           # Database abstraction layer
│   ├── commands.ts           # Command handling system
│   ├── api.ts                # REST API for external access
│   ├── config.ts             # Configuration management
│   └── utils/
│       ├── logger.ts         # Logging utility
│       └── queue.ts          # Message queue for high-volume processing
├── data/                     # Database and other persistent data
├── public/                   # Static files for web dashboard
│   ├── index.html            # Dashboard entry point
│   ├── css/                  # Stylesheets
│   ├── js/                   # Client-side JavaScript
│   └── components/           # UI components
├── tests/                    # Unit and integration tests
│   ├── bot.test.ts
│   ├── analytics.test.ts
│   └── api.test.ts
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

4. **Create Directory Structure**:
   ```bash
   mkdir -p src/utils data public/{css,js,components} tests logs
   ```

5. **Implement Core Modules**:
   - Start with utility modules: `logger.ts` and `queue.ts`
   - Implement core modules: `config.ts`, `database.ts`, `analytics.ts`
   - Implement bot-related modules: `commands.ts`, `bot.ts`
   - Add API functionality: `api.ts`
   - Create application entry point: `index.ts`

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

- **Bot**: `BotOptions`, `ChannelState`, `AnalysisState`, `ChatMessage`, `BotInterface`
- **Analytics**: `AnalyticsOptions`, `SentimentResult`, `TrendAnalysisResult`, `WordFrequency`, `AnalyticsEngine`
- **Database**: `DatabaseOptions`, `QueryOptions`, `SentimentResultData`, `AggregatedStats`, `DatabaseInterface`
- **Commands**: `CommandOptions`, `Command`, `CommandHandlerOptions`, `Permission`
- **API**: `APIOptions`, `AuthOptions`, `APIInterface`
- **Config**: `BotConfig`, `DatabaseConfig`, `AnalyticsConfig`, `APIConfig`, `Config`
- **Queue**: `MessageQueueOptions`, `QueueMetrics`, `MessageProcessor`

## Configuration

The bot can be configured through both environment variables and a configuration file:

1. **Environment Variables**:
   ```
   # Twitch Bot Configuration
   BOT_USERNAME=your_bot_username
   OAUTH_TOKEN=oauth:your_oauth_token
   CHANNELS=channel1,channel2,channel3

   # Bot Settings
   BOT_DEBUG=false
   BOT_COMMAND_PREFIX=!
   BOT_ANALYSIS_INTERVAL=60000
   BOT_QUEUE_SIZE=1000
   BOT_PROCESS_INTERVAL=500

   # Database Configuration
   DB_TYPE=sqlite
   DB_CONNECTION=./data/sentiments.db

   # Analytics Configuration
   SENTIMENT_ANALYZER=basic
   CUSTOM_DICTIONARY_PATH=./data/custom_dictionary.json

   # API Configuration
   ENABLE_API=true
   API_PORT=3000
   API_AUTH_ENABLED=false
   API_KEY=your_secret_api_key

   # Logging
   LOG_LEVEL=info
   ```

2. **Configuration File** (`config.json`):
   The configuration file is automatically created with default values and can be modified manually.

## REST API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Get API status |
| `/api/analysis/state` | GET | Get current analysis state |
| `/api/analysis/start` | POST | Start analysis for a channel |
| `/api/analysis/stop` | POST | Stop analysis for a channel |
| `/api/analysis/interval` | POST | Set analysis interval |
| `/api/sentiment/:channel` | GET | Get sentiment results for a channel |
| `/api/sentiment/:channel/latest` | GET | Get latest sentiment result |
| `/api/sentiment/:channel/stats` | GET | Get aggregated stats |
| `/api/sentiment/:channel/trends` | GET | Analyze sentiment trends |

## Chat Commands

| Command | Description | Permissions |
|---------|-------------|------------|
| `!startanalysis` | Start sentiment analysis | moderator, broadcaster |
| `!stopanalysis` | Stop sentiment analysis | moderator, broadcaster |
| `!setinterval <seconds>` | Set analysis interval | moderator, broadcaster |
| `!currentsentiment` | Show current sentiment | all users |

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

2. **Add New API Endpoints**:
   Extend the API module with custom endpoints by accessing the Express app:
   ```typescript
   const api = initializeAPI({ /* options */ });
   const app = api.getApp();
   
   app.get('/api/custom', (req, res) => {
     res.json({ custom: 'data' });
   });
   ```
