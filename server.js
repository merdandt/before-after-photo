import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT) || 8080;

console.log('Starting server initialization...');

// Serve static files from the dist directory
const distPath = path.join(__dirname, 'dist');
console.log(`Serving static files from: ${distPath}`);
app.use(express.static(distPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Application loading... (or build failed)');
    }
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server successfully started and listening on port ${PORT}`);
});

server.on('error', (e) => {
  console.error('Server failed to start:', e);
  process.exit(1);
});