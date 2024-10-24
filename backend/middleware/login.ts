import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'; // Import jsonwebtoken
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Set the secret key for JWT

// Middleware to check if the user is logged in
const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = decoded.userId; // Assign the userId to the request object
      return next(); // User is logged in, proceed to the next middleware or route
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }

  // If the token is not valid or missing, send a redirect response to the frontend
  return res.status(401).json({ redirect: 'http://localhost:5173/auth' });
};

export default isLoggedIn;

