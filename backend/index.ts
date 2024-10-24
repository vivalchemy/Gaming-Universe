import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Optional: To handle cookies

// routers
import authRouter from './routes/auth';
import leaderboardRouter from './routes/leaderboard';
import storeRouter from './routes/store';
import runRouter from './routes/run';

// middleware
import isLoggedIn from './middleware/login';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware for handling cookies
app.use(express.static(path.join(__dirname, 'static'))); // Serve static files from the 'static' directory

app.use('/', authRouter); // user auth
// leaderboard
app.use("/leaderboard", leaderboardRouter);
// store
app.use("/store", isLoggedIn, storeRouter);
// progress
app.use("/run", isLoggedIn, runRouter);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

