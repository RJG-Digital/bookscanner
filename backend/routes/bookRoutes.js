import express from 'express';
import { searchBookByTitle, searchBookByAuthor, searchBookByIsbn, scanSearch, getLatestBooks, getBooksBySearchTerm, getBookByIsbn } from '../controllers/bookController.js';
const router = express.Router();

// New
router.get('/search/title', searchBookByTitle);
router.get('/search/author', searchBookByAuthor);
router.get('/search/isbn', searchBookByIsbn);
router.get('scan/:term', scanSearch);
// Recurring
router.get('/latest/:days', getLatestBooks);
// Old
router.get('/search/:term', getBooksBySearchTerm);
router.get('/:isbn', getBookByIsbn);

export default router;