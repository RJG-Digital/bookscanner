import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import colors from 'colors';
import bodyParser from 'body-parser';
import bookRoutes from './routes/bookRoutes.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api/books', bookRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is now running on port ${PORT}`.green.inverse);
});