const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { connectDB } = require('./config/database');
const { startScheduler } = require('./services/scheduler');

const PORT = Number(process.env.PORT || 5000);

async function start() {
  try {
    const connected = await connectDB();

    if (!connected && process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is required for production Node runtime');
    }

    if (connected && process.env.ENABLE_IN_PROCESS_SCHEDULER !== 'false') {
      startScheduler();
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Wahy Wa Namaa API listening on http://localhost:${PORT}`);
    });

    server.on('error', (error) => {
      console.error('SERVER LISTEN ERROR:', error);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error('Backend startup failed:', error.message);
    process.exit(1);
  }
}

start();
