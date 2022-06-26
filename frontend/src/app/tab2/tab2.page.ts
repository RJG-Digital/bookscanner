import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Book } from '../models/book';
import { BookService } from '../services/book/book.service';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy {
  public books: Book[] = [];
  public filterType = 'all';
  private unsubscribe = new Subject<void>();
  constructor(private storageService: StorageService, private bookService: BookService, private router: Router) { }

  ngOnInit(): void {
    this.storageService.bookShelf$.pipe(takeUntil(this.unsubscribe)).subscribe(books => {
      if (books && books.length) {
        this.books = books;
      } else {
        this.books = [];
      }
    })
  }
  public async removeFromSelf(bookTitle: string) {
    await this.storageService.removeFromBookShelf(bookTitle);
    await this.filterBooks(this.filterType);
  }

  public async markTaken(bookTitle: string) {
    await this.storageService.updateIsTestTaken(bookTitle, true);
    await this.filterBooks(this.filterType);
  }

  public async markUnTaken(bookTitle: string) {
    await this.storageService.updateIsTestTaken(bookTitle, false);
    await this.filterBooks(this.filterType);
  }

  public viewBook(book: Book): void {
    this.bookService.selectedBook$.next(book);
    this.router.navigate(['book']);
  }

  public async onFilterChange(event) {
    this.filterType = event.detail.value;
    await this.filterBooks(event.detail.value);
  }

  private async filterBooks(filterType: string) {
    console.log(this.filterType);
    switch (filterType) {
      case 'taken':
        this.books = await this.storageService.getQuizTakenBooks();
        console.log('Taken ', this.books);
        break;
      case 'unTaken':

        this.books = await this.storageService.getQuizNotTakenBooks();
        console.log('Not Taken ', this.books);
        break;
      case 'all':

        this.books = await this.storageService.getBookshelf();
        console.log('All ', this.books);
        break;
      default: break;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
