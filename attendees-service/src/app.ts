import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import attendeesRouter from './routes/attendees.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/attendees', attendeesRouter);

app.get('/health', (req, res) => res.json({ 
  status: 'healthy', 
  service: 'attendees-service',
  port: config.port 
}));

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 Attendees Service running on port ${config.port}`);
  });
}

export default app;