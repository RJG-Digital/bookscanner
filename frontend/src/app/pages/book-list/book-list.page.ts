import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Book } from 'src/app/models/book';
import { BookService } from 'src/app/services/book/book.service';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.page.html',
  styleUrls: ['./book-list.page.scss'],
})
export class BookListPage implements OnInit, OnDestroy {
  public books: Book[] = [];
  private unsubscribe = new Subject<void>();

  constructor(private bookService: BookService, private router: Router) { }

  ngOnInit() {
    this.bookService.bookList$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((books: Book[]) => {
        if (books && books.length) {
          this.books = books;
        }
      });
  }
  public viewBook(book: Book) {
    this.bookService.selectedBook$.next(book);
    this.router.navigate(['book']);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
