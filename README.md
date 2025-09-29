# DBUS Bot

A Discord bot for accessing Donostia bus information using the DBUS API v1.0.0.

## Features

- **🚌 Bus Lines**: View all available bus lines
- **🚏 Bus Stops**: Get stops for specific bus lines  
- **⏰ Arrival Times**: Real-time bus arrival information
- **💚 Health Check**: Monitor API status

## Commands

- `/lines` - Show all available bus lines with pagination
- `/stops <line>` - Show all stops for a specific bus line
- `/arrival <line> <stop>` - Get arrival time for a bus at a stop
- `/health` - Check DBUS API health status

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KingJorjai/dbus-bot.git
   cd dbus-bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the bot**:
   - Copy `config.json.example` to `config.json`
   - Add your Discord bot token and client ID:
   ```json
   {
     "token": "YOUR_BOT_TOKEN",
     "clientId": "YOUR_CLIENT_ID"
   }
   ```

4. **Deploy slash commands**:
   ```bash
   node src/deploy-commands.js
   ```

5. **Start the bot**:
   ```bash
   npm run dev
   ```

## API Configuration

The bot uses the DBUS API v1.0.0. By default, it's configured for `http://localhost:3000`. 

To change the API URL, edit `src/utils/api-caller.js`:
```javascript
const API_BASE_URL = 'http://your-api-server:port/api/v1';
const HEALTH_URL = 'http://your-api-server:port';
```

## API Information

This bot uses the [DBUS API](https://github.com/GlutenFreeSoftware/dbus-api) which provides:
- Real-time bus information for Donostia
- RESTful API with standardized responses
- Rate limiting and caching
- Health monitoring

See [API_UPDATE.md](./API_UPDATE.md) for detailed information about the API changes and migration notes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC