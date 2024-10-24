import type { Request, Response, NextFunction } from "express";
import path from "path";
import jwt from 'jsonwebtoken'; // Import jsonwebtoken

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Set the secret key for JWT

// Middleware to check if the user is logged in
const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      console.log('Token verified in middleware:', decoded);
      return next(); // User is logged in, proceed to the next middleware or route
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }

  // If the token is not valid or missing, serve the signup page
  return res.sendFile(path.join(__dirname, '../static', 'signup.html'));
};

export default isLoggedIn;
