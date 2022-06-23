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
  public removeFromSelf(bookTitle: string) {
    this.storageService.removeFromBookShelf(bookTitle)
  }

  public markTaken(bookTitle: string) {
    this.storageService.updateIsTestTaken(bookTitle, true);
  }

  public markUnTaken(bookTitle: string) {
    this.storageService.updateIsTestTaken(bookTitle, false);
  }

  public viewBook(book: Book): void {
    this.bookService.selectedBook$.next(book);
    this.router.navigate(['book']);
  }

  public async onFilterChange(event) {
    this.filterType = event.detail.value;
    switch (event.detail.value) {
      case 'taken':
        this.books = await this.storageService.getQuizTakenBooks();
        break;
      case 'unTaken':
        this.books = await this.storageService.getQuizNotTakenBooks();
        break;
      case 'all':
        this.books = await this.storageService.getBookshelf();
        break;
      default: break;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
