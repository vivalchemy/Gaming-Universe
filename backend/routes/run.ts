import { Router, type Request, type Response } from "express";
import pb from "../pocketbase/config";
import { type RecordModel } from "pocketbase";
import { z } from "zod"; // For input validation

// Define interfaces for type safety
interface RunRecord extends RecordModel {
  user: string;
  level: number;
  progress: number;
  started_at: string;
  finished_at: string | null;
}


const updateLevelSchema = z.object({
  runId: z.string().min(1),
});

const updateProgressSchema = z.object({
  runId: z.string().min(1),
  increment: z.number().min(0),
});

const getRunSchema = z.object({
  runId: z.string().min(1),
});

const router = Router();

// Helper function for error responses
const handleError = (error: unknown, res: Response) => {
  console.error('Error:', error);
  if (error instanceof z.ZodError) {
    return res.status(400).json({ error: 'Invalid input', details: error.errors });
  }
  res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
};

// Create a new run
router.post('/create', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Creating a new run...');
    const userId = req.userId
    console.log(`User ID: ${userId}`);

    const data = {
      user: userId,
      level: 1,
      progress: 0,
      started_at: new Date().toISOString(),
      finished_at: null
    };

    const record = await pb.collection('runs').create<RunRecord>(data);
    console.log('Run created:', record);
    res.status(201).json(record);
  } catch (error) {
    handleError(error, res);
  }
});

// Update level
router.patch('/level', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Updating level...');
    const userId = req.userId
    //
    //
    const { runId } = updateLevelSchema.parse(req.body);
    //
    //
    console.log(`Run ID: ${runId}, User ID: ${userId}`);

    const record = await pb.collection('runs').getOne<RunRecord>(runId);
    console.log('Fetched record:', record);

    if (record.user !== userId) {
      console.warn('Unauthorized access attempt.');
      res.status(403).json({ error: 'Unauthorized' });
    }

    if (record.progress < 100) {
      console.warn('Cannot advance level before completing current level.');
      res.status(400).json({ error: 'Cannot advance level before completing current level' });
    }

    const updatedRecord = await pb.collection('runs').update<RunRecord>(runId, {
      level: record.level + 1,
      progress: 0
    });
    console.log('Level updated:', updatedRecord);
    res.json(updatedRecord);
  } catch (error) {
    handleError(error, res);
  }
});

// Update progress
router.patch('/progress', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Updating progress...');
    const userId = req.userId
    //
    //
    const { runId, increment } = updateProgressSchema.parse(req.body);
    //
    //
    console.log(`Run ID: ${runId}, User ID: ${userId}, Increment: ${increment}`);

    const record = await pb.collection('runs').getOne<RunRecord>(runId);
    console.log('Fetched record:', record);

    if (record.user !== userId) {
      console.warn('Unauthorized access attempt.');
      res.status(403).json({ error: 'Unauthorized' });
    }

    // Update progress
    let newProgress = Math.min(100, Math.max(0, record.progress + increment));
    console.log(`New progress calculated: ${newProgress}`);

    // Check for special condition: if progress is 1
    let updatedLevel = record.level;
    if (newProgress >= 100) {
      console.log('Progress reached 100%, resetting to 0 and incrementing level...');
      updatedLevel += 1;
      newProgress = 0;
    } else if (newProgress === 1) {
      console.log('Progress reached 1, resetting to 0 and incrementing level...');
      updatedLevel += 1;
      newProgress = 0;
    }

    const updatedRecord = await pb.collection('runs').update<RunRecord>(runId, {
      level: updatedLevel,
      progress: newProgress
    });
    console.log('Progress updated:', updatedRecord);
    res.json(updatedRecord);
  } catch (error) {
    handleError(error, res);
  }
});

// Get all runs for user
router.get('/user', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Fetching all runs for user...');
    const userId = req.userId
    console.log(`User ID: ${userId}`);

    const records = await pb.collection('runs').getFullList<RunRecord>({
      filter: `user = "${userId}"`,
      sort: '-created'
    });
    console.log('Fetched records:', records);
    res.json(records);
  } catch (error) {
    handleError(error, res);
  }
});

// Get latest run
router.get('/latest', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Fetching latest run...');
    const userId = req.userId
    console.log(userId)
    console.log(`User ID: ${userId}`);

    const records = await pb.collection('runs').getList<RunRecord>(1, 1, {
      filter: `user = "${userId}"`,
      sort: '-started_at'
    });

    if (records.items.length === 0) {
      console.warn('No runs found for user.');
      res.status(404).json({ error: 'No runs found' });
    }

    console.log('Latest run fetched:', records.items[0]);
    res.json(records.items[0]);
  } catch (error) {
    handleError(error, res);
  }
});

// Get specific run
router.get('/:runId', async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;
  try {
    console.log('Fetching specific run...');
    const { runId } = getRunSchema.parse({
      runId: req.params.runId,
    });
    console.log(`Run ID: ${runId}, User ID: ${userId}`);

    const record = await pb.collection('runs').getOne<RunRecord>(runId);
    console.log('Fetched record:', record);

    if (record.user !== userId) {
      console.warn('Unauthorized access attempt.');
      res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(record);
  } catch (error) {
    handleError(error, res);
  }
});


export default router;

