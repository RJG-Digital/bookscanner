import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as Cordovasqlitedriver from 'localforage-cordovasqlitedriver';
import { BehaviorSubject } from 'rxjs';
import { Book } from 'src/app/models/book';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public isFavorited$ = new BehaviorSubject<boolean>(false);
  public favoritedBooks$ = new BehaviorSubject<Book[]>([]);
  public bookShelf$ = new BehaviorSubject<Book[]>([]);
  public storageReady$ = new BehaviorSubject<boolean>(false);

  constructor(private storage: Storage) { }

  public async init() {
    await this.storage.defineDriver(Cordovasqlitedriver);
    await this.storage.create();
    this.storageReady$.next(true);
  }

  public async loadBookShelf(): Promise<void> {
    const books = await this.storage.get('bookshelf') || [];
    this.bookShelf$.next(books);
  }

  public async getBookshelf(): Promise<Book[]> {
    const books = await this.storage.get('bookshelf') || [];
    return books;
  }

  public async addToBookSelf(book: Book): Promise<void> {
    const storedBooks = await this.getBookshelf();
    storedBooks.push(book);
    await this.storage.set('bookshelf', storedBooks);
    this.bookShelf$.next(storedBooks);
  }

  public async removeFromBookShelf(value: string): Promise<void> {
    const storedBooks = await this.getBookshelf();
    const newBooks = storedBooks.filter(book => book.title !== value);
    await this.storage.set('bookshelf', newBooks);
    this.bookShelf$.next(newBooks);
  }

  public async updateIsTestTaken(bookTitle: string, isTestTaken: boolean) {
    const storedBooks = await this.getBookshelf();
    const foundBook = storedBooks.find(book => book.title === bookTitle);
    if (foundBook) {
      foundBook.isTestTaken = isTestTaken;
      const index = storedBooks.findIndex(book => book.title === bookTitle);
      storedBooks[index] = foundBook;
      await this.storage.set('bookshelf', storedBooks);
      this.bookShelf$.next(storedBooks);
    }
  }

  public async getQuizTakenBooks() {
    const allBooks = await this.getBookshelf();
    const quizTakenBooks = allBooks.filter(b => b.isTestTaken);
    return quizTakenBooks;
  }

  public async getQuizNotTakenBooks() {
    const allBooks = await this.getBookshelf();
    const quizNotTakenBooks = allBooks.filter(b => !b.isTestTaken);
    return quizNotTakenBooks;
  }
}
