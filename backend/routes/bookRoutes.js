import express from 'express';
import { getBookByIsbn } from '../controllers/bookController.js';
const router = express.Router();

router.get('/:isbn', getBookByIsbn);

export default router;