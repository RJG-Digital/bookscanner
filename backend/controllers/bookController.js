import asynchandler from 'express-async-handler';
import dotenv from 'dotenv';
import colors from 'colors';
import puppeteer from 'puppeteer';
import {
    ACCELERATED_READER_URL,
    ACCEPT_COOKIE_ID,
    TEACHER_RADIO_ID,
    USER_TYPE_SUBMIT_BUTTON_ID,
    SEARCH_INPUT_FIELD_ID,
    SUBMIT_SEARCH_BUTTON_ID,
    BOOK_LIST_TITLE_ID,
    BOOK_LEVEL_ID,
    BOOK_PICTURE_ID,
    BOOK_INTEREST_LEVEL_ID,
    BOOK_POINTS_ID,
    BOOK_WORD_COUNT_ID,
    BOOK_FICTION_NONFICTION_ID,
    BOOK_TITLE_ID,
    BOOK_AUTHOR_ID,
    BOOK_DESCRIPTION_ID,
    BOOK_QUIZ_NUMBER_ID,
    BOOK_QUIZ_TYPE_ID,
    BOOK_TOPIC_ID,
    BOOK_SERIES_ID,
    BOOK_LANGUAGE_CODE_ID
} from '../config.js'

dotenv.config();

const getBookByIsbn = asynchandler(async (req, res) => {
    try {
        const { isbn } = req.params;
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.goto(ACCELERATED_READER_URL);
        await page.click(ACCEPT_COOKIE_ID); // accept cookies

        await page.waitForSelector(TEACHER_RADIO_ID, { visible: true }); // select teacher user type
        await page.click(TEACHER_RADIO_ID);

        await page.waitForSelector(USER_TYPE_SUBMIT_BUTTON_ID, { visible: true }); // submit and go to search page
        await page.waitForTimeout(1500);
        await page.click(USER_TYPE_SUBMIT_BUTTON_ID);

        await page.waitForSelector(SEARCH_INPUT_FIELD_ID, { visible: true }); // put book ISBN into search input
        await page.click(SEARCH_INPUT_FIELD_ID);
        await page.type(SEARCH_INPUT_FIELD_ID, isbn);

        await page.click(SUBMIT_SEARCH_BUTTON_ID); // submit search
        await page.waitForSelector(BOOK_LIST_TITLE_ID, { timeout: 5000 }); // select the list of books that return and choose the first one (5 sec timeout).
        await page.waitForTimeout(1000);
        let bookList = await page.$$(BOOK_LIST_TITLE_ID);
        if (!bookList.length) {
            res.status(404);
            throw new Error(`Book with the ISBN of ${bookIsbn} was not found.`);
        }

        const [response] = await Promise.all([
            page.waitForNavigation(), // The promise resolves after navigation has finished

            bookList[0].click() // Clicking the link will indirectly cause a navigation
        ]);

        await page.waitForSelector(BOOK_PICTURE_ID, { timeout: 5000 });
        const book = await page.evaluate(() => {
            // gather book data
            const picture = document
                .querySelector('#ctl00_ContentPlaceHolder1_ucBookDetail_imgBookCover')
                .getAttribute('src');
            const level = parseInt(document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookLevel'
            ).innerText.trim());
            const interestLevel = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblInterestLevel'
            ).innerText.trim();
            const points = parseInt(document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblPoints'
            ).innerText.trim());
            const wordCount = parseInt(document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblWordCount'
            ).innerText);
            const fictionNonFiction = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblFictionNonFiction'
            ).innerText;
            const title = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookTitle'
            ).innerText;
            const author = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblAuthor'
            ).innerText;
            const description = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookSummary'
            ).innerText;
            const quizNumber = parseInt(document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblQuizNumber'
            ).innerText);
            const quizTypes = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblQuizStatusLabel'
            ).innerText.trim().split(';');
            const topics = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblTopicLabel'
            ).innerText.trim().split('; ');
            const series = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblSeriesLabel'
            ).innerText.trim().split('; ');
            const languageCode = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblLanguageCode'
            ).innerText;
            return {
                title,
                author,
                description,
                picture,
                level,
                points,
                quizNumber,
                quizTypes,
                wordCount,
                interestLevel,
                fictionNonFiction,
                topics,
                series,
                languageCode,
            };
        });
        await browser.close();
        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404);
            throw new Error('book was not found.')
        }
    } catch (error) {
        if (error instanceof puppeteer.errors.TimeoutError) {
            res.status(404);
            throw new Error('book was not found.')
        }
    }
});

export { getBookByIsbn };