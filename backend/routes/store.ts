import { Router, type Request, type Response } from 'express';
import pb from '../pocketbase/config';
import isLoggedIn from '../middleware/login';

const router = Router();

// Enum for store items
enum StoreItems {
  BOOSTER = 'booster',
  MAGNET = 'magnet',
  SHIELD = 'shield',
  AMMO = 'ammo',
  COIN_DOUBLER = 'coin_doubler',
}


// get user items
router.get("/get-items", async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetching items from the "items" collection
    const items = await pb.collection("items").getFullList({
      sort: '-cost'  // Sorting items by creation date, latest first
    });

    if (!items || items.length === 0) {
      res.status(404).json({ error: "No items found" });
      return;
    }

    // Return the items in the response
    res.status(200).json(items);
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching items:", error);

    // Provide a more descriptive error message
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: `Couldn't fetch the items: ${errorMessage}` });
  }
});

// Purchase route
router.post('/purchase', async (req: Request, res: Response): Promise<void> => {
  const { userId, itemName } = req.body;

  // Check if the item name is valid
  if (!Object.values(StoreItems).includes(itemName)) {
    res.status(400).json({ error: 'Invalid item name.' });
    return; // Add return statement
  }

  try {
    // Fetch the item details from the items collection
    let item;
    try {
      item = await pb.collection('items').getFirstListItem(`name="${itemName}"`);
    } catch (error) {
      res.status(404).json({ error: 'Item not found in the database.' });
      return;
    }

    if (!item) {
      res.status(404).json({ error: 'Item not found in the database.' });
      return;
    }

    // Get user information, including coin balance
    const user = await pb.collection('users').getOne(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (user.coins < item.cost) {
      res.status(400).json({ error: 'Not enough coins.' });
      return;
    }

    // Deduct the cost from the user's coin balance
    await pb.collection('users').update(userId, {
      coins: user.coins - item.cost,
    });

    // Check if the user already has the item
    let userItemRecord = null;
    try {
      userItemRecord = await pb.collection('user_items').getFirstListItem(`user="${userId}" && item="${item.id}"`);
    } catch (error) {
      // If record is not found, userItemRecord will remain null
      // This is expected for new purchases
    }

    if (userItemRecord) {
      // User already has the item, increase the count
      await pb.collection('user_items').update(userItemRecord.id, {
        count: userItemRecord.count + item.count,
      });
    } else {
      // User does not have the item, create a new record
      await pb.collection('user_items').create({
        user: userId,
        item: item.id,
        count: item.count,
      });
    }

    res.status(200).json({ msg: 'Item purchased successfully.' });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({
      msg: 'An error occurred during purchase.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

router.post('/use-item', async (req: Request, res: Response): Promise<void> => {
  const { userId, itemName } = req.body;

  // Input validation
  if (!userId || !itemName) {
    res.status(400).json({ error: 'Missing required fields: userId and itemName.' });
    return;
  }

  // Check if the item name is valid
  if (!Object.values(StoreItems).includes(itemName)) {
    res.status(400).json({ error: 'Invalid item name.' });
    return;
  }

  try {
    // Get the user's item record along with the item details in a single query
    let userItemRecord;
    try {
      userItemRecord = await pb.collection('user_items').getFirstListItem(`user="${userId}" && item.name="${itemName}"`, {
        expand: 'item' // This will include the item details in the response
      });
    } catch (error) {
      res.status(404).json({ error: 'You do not own this item.' });
      return;
    }

    if (!userItemRecord) {
      res.status(404).json({ error: 'You do not own this item.' });
      return;
    }

    // Check if user has enough of the item to use
    if (userItemRecord.count < 1) {
      res.status(400).json({ error: 'You do not have enough of this item remaining.' });
      return;
    }

    // Calculate new count
    const newCount = userItemRecord.count - 1;

    try {
      if (newCount === 0) {
        // If this was the last item, delete the record
        await pb.collection('user_items').delete(userItemRecord.id);
      } else {
        // Otherwise update the count
        await pb.collection('user_items').update(userItemRecord.id, {
          count: newCount
        });
      }

      // Return the new count to the client
      res.status(200).json({
        msg: 'Item used successfully.',
        remainingCount: newCount
      });

    } catch (error) {
      console.error('Error updating item count:', error);
      res.status(500).json({
        error: 'Failed to update item count.',
        details: error instanceof Error ? error.message : String(error)
      });
    }

  } catch (error) {
    console.error('Error processing item usage:', error);
    res.status(500).json({
      error: 'An error occurred while processing the request.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});


router.post("/get-items-with-user-info", async (req: Request, res: Response): Promise<void> => {
  const { userId, coins } = req.body;

  if (!userId || coins === undefined) {
    res.status(400).json({ error: "Missing required fields: userId and coins." });
    return;
  }

  try {
    // Fetch all items from the "items" collection
    const items = await pb.collection("items").getFullList({
      sort: '-cost'  // Sorting items by cost, highest first
    });

    if (!items || items.length === 0) {
      res.status(404).json({ error: "No items found" });
      return;
    }

    // Fetch user items to check what the user already owns
    const userItems = await pb.collection('user_items').getFullList({
      filter: `user="${userId}"`,
      expand: 'item'
    });

    const userItemsMap = userItems.reduce((map, userItem) => {
      map[userItem.item] = userItem.count; // Store the count of the items user owns
      return map;
    }, {} as Record<string, number>);

    // Prepare the response with item details
    const response = items.map(item => {
      const ownedCount = userItemsMap[item.id] || 0;
      const canBuy = coins >= item.cost;

      return {
        ...item,
        count: ownedCount, // Show 1 if user owns the item, 0 otherwise
        canBuy, // Set canBuy based on the user's coins
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching items with user info:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: `Couldn't fetch the items: ${errorMessage}` });
  }
});

export default router;
