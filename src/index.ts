import express from 'express';
import userRoutes from './routes/user.routes';
import candidateRoutes from './routes/candidate.routes';
import jobRoutes from './routes/job.routes';
import noteRoutes from './routes/note.routes';

const app = express();
const PORT = 8080;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/users', userRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/candidates/:id/notes', noteRoutes);
app.use('/api/jobs', jobRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
