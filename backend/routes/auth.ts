import express, { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken
import pb from '../pocketbase/config';
import path from 'path';
import isLoggedIn from '../middleware/login';

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Set the secret key for JWT
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1d'; // Set the expiration time for the JWT


// Route for checking login status
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.token;

  if (!token) {
    // If no token exists, respond with a redirect URL
    res.status(401).json({ redirect: 'http://localhost:5173/auth' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // User is logged in, you can now handle the request further
    res.status(200).json({ message: 'User is logged in', userId: decoded.userId });
  } catch (error) {
    console.error('Token verification failed:', error);
    // On token verification failure, send redirect URL to the frontend
    res.status(401).json({ redirect: 'http://localhost:5173/auth' });
  }
});

// Signup route
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, passwordConfirm } = req.body;

  if (!username || !email || !password || !passwordConfirm) {
    res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== passwordConfirm) {
    res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const user = await pb.collection('users').create({
      username,
      email,
      password,
      passwordConfirm,
      emailVisibility: true,
      name: username,
    });
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error: any) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Signup failed', details: error.message });
  }
});

// Login route
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await pb.collection('users').authWithPassword(email, password);
    console.log('User found:', user);

    // Generate a JWT for the logged-in user
    const token = jwt.sign({ userId: user.record.id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    // Set the token in cookies (optional: you can also send it in the response)
    res.cookie('token', token, { httpOnly: true, secure: false }); // Set secure to true in production

    res.status(200).json({ message: 'Login successful', user });
  } catch (error: any) {
    console.error('Error logging in:', error);
    res.status(401).json({ error: 'Login failed', details: error.message });
  }
});

router.post('/logout', (_req: Request, res: Response): void => {
  // Clear the token cookie
  res.clearCookie('token');
  // Redirect to the signup page or send a response
  res.redirect('/'); // or return res.send('You have been logged out.');
});

export default router;
