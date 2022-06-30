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
    BOOK_PICTURE_ID,
} from '../config.js';
import Book from '../models/bookModel.js'

dotenv.config();

const getBookByIsbn = asynchandler(async (req, res) => {
    const { isbn } = req.params;
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
    });
    try {
        const page = await browser.newPage();
        await page.goto(ACCELERATED_READER_URL);
        await page.click(ACCEPT_COOKIE_ID); // accept cookies

        await page.waitForSelector(TEACHER_RADIO_ID, { visible: true }); // select teacher user type
        await page.click(TEACHER_RADIO_ID);

        await page.waitForSelector(USER_TYPE_SUBMIT_BUTTON_ID, { visible: true }); // submit and go to search page
        await page.waitForTimeout(700);
        await page.click(USER_TYPE_SUBMIT_BUTTON_ID);

        await page.waitForSelector(SEARCH_INPUT_FIELD_ID, { visible: true }); // put book ISBN into search input
        await page.click(SEARCH_INPUT_FIELD_ID);
        await page.type(SEARCH_INPUT_FIELD_ID, isbn);

        await page.click(SUBMIT_SEARCH_BUTTON_ID); // submit search
        await page.waitForSelector(BOOK_LIST_TITLE_ID, { timeout: 5000 }); // select the list of books that return and choose the first one (5 sec timeout).
        await page.waitForTimeout(500);
        let bookList = await page.$$(BOOK_LIST_TITLE_ID);
        if (!bookList.length) {
            res.status(404);
            throw new Error(`Book with the ISBN of ${bookIsbn} was not found.`);
        }
        await Promise.all([
            page.waitForSelector(BOOK_LIST_TITLE_ID, { timeout: 5000 }),// The promise resolves after navigation has finished
            // page.waitForTimeout(500),
            bookList[0].click(), // Clicking the link will indirectly cause a navigation
        ]);

        await page.waitForSelector(BOOK_PICTURE_ID, { timeout: 5000 });
        const book = await page.evaluate(() => {
            // gather book data
            const picture = document
                .querySelector('#ctl00_ContentPlaceHolder1_ucBookDetail_imgBookCover')
                .getAttribute('src');
            const level = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookLevel'
            ).innerText.trim();
            const interestLevel = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblInterestLevel'
            ).innerText.trim();
            const points = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblPoints'
            ).innerText.trim();
            const wordCount = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblWordCount'
            ).innerText.trim();
            const fictionNonFiction = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblFictionNonFiction'
            ).innerText.trim();
            const title = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookTitle'
            ).innerText.trim();
            const author = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblAuthor'
            ).innerText.trim();
            const description = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookSummary'
            ).innerText.trim();
            const quizNumber = document.querySelector(
                '#ctl00_ContentPlaceHolder1_ucBookDetail_lblQuizNumber'
            ).innerText.trim();
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
            ).innerText.trim();
            let rating = document.querySelector('#ctl00_ContentPlaceHolder1_ucBookDetail_lblRanking > img')?.getAttribute('alt') ?
                document.querySelector('#ctl00_ContentPlaceHolder1_ucBookDetail_lblRanking > img').getAttribute('alt') : 'Not yet rated.';

            let isbns = document.querySelector('#ctl00_ContentPlaceHolder1_ucBookDetail_tblPublisherTable > tbody').innerHTML.toString().split('</td>')

            isbns = isbns.slice(5, isbns.length);
            const finalIsbns = [];
            for (let i = 0; i < isbns.length; i++) {
                if (i === 2) {
                    finalIsbns.push(isbns[i].split('<td align="left">')[1]);
                } else if (i % 5 === 2) {
                    finalIsbns.push(isbns[i].split('<td align="left">')[1]);
                }
            }
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
                rating,
                isbns: finalIsbns
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
        await browser.close();
        if (error instanceof puppeteer.errors.TimeoutError) {
            res.status(404);
            throw new Error('book was not found.')
        } else {
            console.log(error.message);
            res.status(500);
            throw new Error('An unknown error occurred.');
        }
    }
});

const getBooksBySearchTerm = asynchandler(async (req, res) => {
    const foundBooks = [];
    const { term } = req.params;
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
    });
    try {
        const page = await browser.newPage();
        await page.goto(ACCELERATED_READER_URL);
        await page.click(ACCEPT_COOKIE_ID); // accept cookies

        await page.waitForSelector(TEACHER_RADIO_ID, { visible: true }); // select teacher user type
        await page.click(TEACHER_RADIO_ID);

        await page.waitForSelector(USER_TYPE_SUBMIT_BUTTON_ID, { visible: true }); // submit and go to search page
        await page.waitForTimeout(700);
        await page.click(USER_TYPE_SUBMIT_BUTTON_ID);

        await page.waitForSelector(SEARCH_INPUT_FIELD_ID, { visible: true }); // put book ISBN into search input
        await page.click(SEARCH_INPUT_FIELD_ID);
        await page.type(SEARCH_INPUT_FIELD_ID, term);

        await page.click(SUBMIT_SEARCH_BUTTON_ID); // submit search
        await page.waitForSelector(BOOK_LIST_TITLE_ID, { timeout: 5000 }); // select the list of books that return and choose the first one (5 sec timeout).
        //await page.waitForTimeout(1000);

        let bookList = await page.$$(BOOK_LIST_TITLE_ID);
        if (!bookList.length) {
            res.status(404);
            throw new Error(`Book with the ISBN of ${bookIsbn} was not found.`);
        }
        await Promise.all([
            page.waitForSelector(BOOK_LIST_TITLE_ID, { timeout: 5000 }),// The promise resolves after navigation has finished
            // page.waitForTimeout(500),
            bookList[0].click(), // Clicking the link will indirectly cause a navigation
        ]);
        let counter = 0
        await page.waitForSelector(BOOK_PICTURE_ID, { timeout: 5000 });
        let nextButton = await page.$$('#ctl00_ContentPlaceHolder1_ucBookDetail_btnNextTitle');
        while (counter < 20) {
            const book = await page.evaluate(async () => {
                // gather book data
                const picture = document
                    .querySelector('#ctl00_ContentPlaceHolder1_ucBookDetail_imgBookCover')
                    .getAttribute('src');
                const level = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookLevel'
                ).innerText.trim();
                const interestLevel = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblInterestLevel'
                ).innerText.trim();
                const points = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblPoints'
                ).innerText.trim();
                const wordCount = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblWordCount'
                ).innerText.trim();
                const fictionNonFiction = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblFictionNonFiction'
                ).innerText.trim();
                const title = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookTitle'
                ).innerText.trim();
                const author = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblAuthor'
                ).innerText.trim();
                const description = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookSummary'
                ).innerText.trim();
                const quizNumber = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblQuizNumber'
                ).innerText.trim();
                const quizTypes = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblQuizStatusLabel'
                ).innerText.trim().split(',');
                const topics = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblTopicLabel'
                ).innerText.trim().split('; ');
                const series = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblSeriesLabel'
                ).innerText.trim().split('; ');
                const languageCode = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblLanguageCode'
                ).innerText.trim();
                let rating = document.querySelector('#ctl00_ContentPlaceHolder1_ucBookDetail_lblRanking > img')?.getAttribute('alt') ?
                    document.querySelector('#ctl00_ContentPlaceHolder1_ucBookDetail_lblRanking > img').getAttribute('alt') : 'Not yet rated.';

                let isbns = document.querySelector('#ctl00_ContentPlaceHolder1_ucBookDetail_tblPublisherTable > tbody').innerHTML.toString().split('</td>')

                isbns = isbns.slice(5, isbns.length);
                const finalIsbns = [];
                for (let i = 0; i < isbns.length; i++) {
                    if (i === 2) {
                        finalIsbns.push(isbns[i].split('<td align="left">')[1]);
                    } else if (i % 5 === 2) {
                        finalIsbns.push(isbns[i].split('<td align="left">')[1]);
                    }
                }
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
                    rating,
                    isbns: finalIsbns
                };

            });
            foundBooks.push(book);
            nextButton = await page.$$('#ctl00_ContentPlaceHolder1_ucBookDetail_btnNextTitle');

            await Promise.all([
                page.waitForSelector('#ctl00_ContentPlaceHolder1_ucBookDetail_btnNextTitle', { timeout: 5000 }),
                nextButton[0].click(),
                page.waitForNavigation(),
            ]);
            counter++;
        }
        // go to next page and do it again
        //ctl00_ContentPlaceHolder1_ucSeachResults_btnNextPageBottom
        console.log(foundBooks.length);
        await browser.close();
        if (foundBooks) {
            res.status(200).json(foundBooks);
        } else {
            res.status(404);
            throw new Error('book was not found.')
        }
    } catch (error) {
        await browser.close();
        if (error instanceof puppeteer.errors.TimeoutError) {
            res.status(404);
            throw new Error('book was not found.')
        } else {
            console.log(error.message);
            res.status(500);
            throw new Error('An unknown error occurred.');
        }
    }
});

const seedDBBooksByType = asynchandler(async (req, res) => {
    const foundBooks = [];
    const { term } = req.params;
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
    });
    try {
        const page = await browser.newPage();
        await page.goto(ACCELERATED_READER_URL);
        await page.click(ACCEPT_COOKIE_ID); // accept cookies

        await page.waitForSelector(TEACHER_RADIO_ID, { visible: true }); // select teacher user type
        await page.click(TEACHER_RADIO_ID);

        await page.waitForSelector(USER_TYPE_SUBMIT_BUTTON_ID, { visible: true }); // submit and go to search page
        await page.waitForTimeout(1500);
        await page.click(USER_TYPE_SUBMIT_BUTTON_ID);

        await page.waitForSelector(SEARCH_INPUT_FIELD_ID, { visible: true }); // put book ISBN into search input

        await page.click('#ctl00_lblAdvancedSearchTabLabel > a');
        await page.waitForSelector('#ctl00_ContentPlaceHolder1_lstQuizType', { visible: true });
        await page.select('#ctl00_ContentPlaceHolder1_lstQuizType', term);
        await page.click('#ctl00_ContentPlaceHolder1_btnDoIt');
        //await page.click(SEARCH_INPUT_FIELD_ID);
        //  await page.type(SEARCH_INPUT_FIELD_ID, term);

        // await page.click(SUBMIT_SEARCH_BUTTON_ID); // submit search
        await page.waitForSelector(BOOK_LIST_TITLE_ID, { timeout: 5000 }); // select the list of books that return and choose the first one (5 sec timeout).
        await page.waitForTimeout(1000);

        let numberPages = await page.evaluate(async () => {
            const pages = document
                .querySelector('#ctl00_ContentPlaceHolder1_ucSeachResults_lblResultsSummaryTop').innerHTML.split(' ');
            return pages[3];
        });
        console.log(numberPages);
        let bookList = await page.$$(BOOK_LIST_TITLE_ID);
        if (!bookList.length) {
            res.status(404);
            throw new Error(`Book with the ISBN of ${bookIsbn} was not found.`);
        }
        await Promise.all([
            page.waitForSelector(BOOK_LIST_TITLE_ID, { timeout: 5000 }),// The promise resolves after navigation has finished
            page.waitForTimeout(500),
            bookList[0].click(), // Clicking the link will indirectly cause a navigation
        ]);
        let counter = 0;
        let foundNewBooksCounter = 0
        await page.waitForSelector(BOOK_PICTURE_ID, { timeout: 5000 });
        let nextButton = await page.$$('#ctl00_ContentPlaceHolder1_ucBookDetail_btnNextTitle');
        let lastBook = null
        console.log('start time', new Date());
        while (nextButton[0]) {
            const book = await page.evaluate(async () => {
                // gather book data
                const picture = document
                    .querySelector('#ctl00_ContentPlaceHolder1_ucBookDetail_imgBookCover')
                    .getAttribute('src');
                const level = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookLevel'
                ).innerText.trim();
                const interestLevel = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblInterestLevel'
                ).innerText.trim();
                const points = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblPoints'
                ).innerText.trim();
                const wordCount = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblWordCount'
                ).innerText.trim();
                const fictionNonFiction = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblFictionNonFiction'
                ).innerText.trim();
                const title = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookTitle'
                ).innerText.trim();
                const author = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblAuthor'
                ).innerText.trim();
                const description = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookSummary'
                ).innerText.trim();
                const quizNumber = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblQuizNumber'
                ).innerText.trim();
                const quizTypes = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblQuizStatusLabel'
                ).innerText.trim().split(',');
                const topics = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblTopicLabel'
                ).innerText.trim().split('; ');
                const series = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblSeriesLabel'
                ).innerText.trim().split('; ');
                const languageCode = document.querySelector(
                    '#ctl00_ContentPlaceHolder1_ucBookDetail_lblLanguageCode'
                ).innerText.trim();
                let rating = document.querySelector('#ctl00_ContentPlaceHolder1_ucBookDetail_lblRanking > img')?.getAttribute('alt') ?
                    document.querySelector('#ctl00_ContentPlaceHolder1_ucBookDetail_lblRanking > img').getAttribute('alt') : 'Not yet rated.';

                let isbns = document.querySelector('#ctl00_ContentPlaceHolder1_ucBookDetail_tblPublisherTable > tbody').innerHTML.toString().split('</td>')

                isbns = isbns.slice(5, isbns.length);
                const finalIsbns = [];
                for (let i = 0; i < isbns.length; i++) {
                    if (i === 2) {
                        finalIsbns.push(isbns[i].split('<td align="left">')[1]);
                    } else if (i % 5 === 2) {
                        finalIsbns.push(isbns[i].split('<td align="left">')[1]);
                    }
                }
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
                    rating,
                    isbns: finalIsbns
                };

            });
            if (lastBook === book) {
                console.log('Same!');
            }
            const foundBook = await Book.findOne({ title: book.title, author: book.author });
            if (!foundBook) {
                const savedBook = await Book.create(book);
                foundNewBooksCounter++;
            } else if (foundBook) {
                console.log(`Found in DB`);
            }
            counter++;
            //  foundBooks.push(book);
            if (counter % 100 === 0) {
                console.log(`Books looked through: ${counter} - New Books Found: ${foundNewBooksCounter} - time: `, new Date());
            }
            nextButton = await page.$$('#ctl00_ContentPlaceHolder1_ucBookDetail_btnNextTitle');

            await Promise.all([
                page.waitForSelector('#ctl00_ContentPlaceHolder1_ucBookDetail_btnNextTitle', { timeout: 5000 }),
                nextButton[0].click(),
                page.waitForNavigation(),
            ]);
            lastBook = book;
        }
        // go to next page and do it again
        //ctl00_ContentPlaceHolder1_ucSeachResults_btnNextPageBottom
        await browser.close();
        if (foundBooks) {
            res.status(200).json(foundBooks);
        } else {
            res.status(404);
            throw new Error('book was not found.')
        }
    } catch (error) {
        if (error instanceof puppeteer.errors.TimeoutError) {
            res.status(404);
            throw new Error('book was not found.')
        } else {
            console.log(error.message);
            res.status(500);
            throw new Error('An unknown error occurred.');
        }
    }
});

export { getBookByIsbn, getBooksBySearchTerm, seedDBBooksByType };
