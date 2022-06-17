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
  public storageReady$ = new BehaviorSubject<boolean>(false);

  constructor(private storage: Storage) { }

  public async init() {
    await this.storage.defineDriver(Cordovasqlitedriver);
    await this.storage.create();
    this.storageReady$.next(true);
  }

  public async loadBooks(): Promise<void> {
    const books = await this.storage.get('books') || [];
    this.favoritedBooks$.next(books);
  }

  public async getBooks(): Promise<Book[]> {
    const books = await this.storage.get('books') || [];
    return books;
  }

  public async addBook(book: Book): Promise<void> {
    const storedBooks = await this.getBooks();
    storedBooks.push(book);
    await this.storage.set('books', storedBooks);
    this.favoritedBooks$.next(storedBooks);
  }

  public async removeBook(value: string): Promise<void> {
    const storedBooks = await this.getBooks();
    const newBooks = storedBooks.filter(book => book.title !== value);
    await this.storage.set('books', newBooks);
    this.favoritedBooks$.next(newBooks);
  }
}
