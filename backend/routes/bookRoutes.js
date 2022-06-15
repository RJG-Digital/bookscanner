import express from 'express';
import { getBookByIsbn, getBooksBySearchTerm } from '../controllers/bookController.js';
const router = express.Router();

router.get('/search/:term', getBooksBySearchTerm);
router.get('/:isbn', getBookByIsbn);

export default router;