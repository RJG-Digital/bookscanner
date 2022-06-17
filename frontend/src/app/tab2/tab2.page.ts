import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
  private unsubscribe = new Subject<void>();
  constructor(private storageService: StorageService, private bookService: BookService, private router: Router) { }

  ngOnInit(): void {
    this.storageService.favoritedBooks$.pipe(takeUntil(this.unsubscribe)).subscribe(books => {
      if (books && books.length) {
        this.books = books;
      } else {
        this.books = [];
      }
    })
  }

  public viewBook(book: Book): void {
    this.bookService.selectedBook$.next(book);
    this.router.navigate(['book']);
  }

  public async removeFromFavorites(title: string): Promise<void> {
    await this.storageService.removeBook(title);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
