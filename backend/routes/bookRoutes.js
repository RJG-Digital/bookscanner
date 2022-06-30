import express from 'express';
import { getBookByIsbn, getBooksBySearchTerm, seedDBBooksByType } from '../controllers/bookController.js';
const router = express.Router();

router.get('/search/:term', getBooksBySearchTerm);
router.get('/:isbn', getBookByIsbn);
router.get('/type/:term', seedDBBooksByType);

export default router;