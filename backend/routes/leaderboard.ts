import { Router, type Request, type Response } from 'express';
import pb from '../pocketbase/config';
const router = Router();

interface LeaderboardItem {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  level: number;
  progress: number;
  started_at: string;
  finished_at?: string | null;
  timeDifference?: number;
  timeFormatted?: string;
  rank?: number;
  expand?: {
    user?: {
      username: string;
      avatar?: string;
    }
  }
}

interface LeaderboardResponse {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  items: LeaderboardItem[];
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const pageNumber = Math.max(1, parseInt(req.query.page as string) || 1);
    const perPage = Math.min(100, parseInt(req.query.perPage as string) || 30);
    const timeFrame = (req.query.timeFrame as string) || 'all'; // all, daily, weekly, monthly

    // Calculate date range based on timeFrame
    let dateFilter = '';
    const now = new Date();
    if (timeFrame !== 'all') {
      const startDate = new Date();
      switch (timeFrame) {
        case 'daily':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      dateFilter = `created >= "${startDate.toISOString()}"`;
    }

    // Fetch leaderboard data with user expansion
    const leaderboard = await pb.collection("runs").getList(pageNumber, perPage, {
      sort: "-level,-progress",
      filter: dateFilter,
      expand: 'user'
    });

    // Process and format items
    const rankedItems: LeaderboardItem[] = leaderboard.items.map((item: any, index: number) => {
      const startTime = new Date(item.started_at);
      const finishTime = item.finished_at ? new Date(item.finished_at) : new Date();
      const timeDifference = finishTime.getTime() - startTime.getTime();

      // Format time difference
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      return {
        ...item,
        rank: ((pageNumber - 1) * perPage) + index + 1,
        timeDifference,
        timeFormatted: `${hours}h ${minutes}m ${seconds}s`,
      } as LeaderboardItem;
    });

    // Sort with refined logic
    rankedItems.sort((a, b) => {
      // Primary sort by level
      if (b.level !== a.level) return b.level - a.level;

      // Secondary sort by progress
      if (b.progress !== a.progress) return b.progress - a.progress;

      // Tertiary sort by time (faster times first)
      return (a.timeDifference || 0) - (b.timeDifference || 0);
    });

    const response: LeaderboardResponse = {
      page: leaderboard.page,
      perPage: leaderboard.perPage,
      totalPages: leaderboard.totalPages,
      totalItems: leaderboard.totalItems,
      items: rankedItems,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      error: 'An error occurred while fetching the leaderboard.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
