import express from 'express';
import path from 'path';
import { apiRouter } from './server/apiRouter';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use('/api', apiRouter);

// Serve static build assets if available
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ScratchMaster AI server running on http://0.0.0.0:${PORT}`);
});
