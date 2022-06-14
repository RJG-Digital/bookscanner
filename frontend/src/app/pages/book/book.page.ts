import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { Book } from 'src/app/models/book';
import { BookService } from 'src/app/services/book/book.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
})
export class BookPage implements OnInit, OnDestroy {
  public book: Book
  private unsubscribe = new Subject<void>();
  constructor(private bookService: BookService) { }

  ngOnInit() {
    this.bookService.selectedBook$.pipe(take(2))
      .subscribe(book => {
        console.log(book);
        if (book) {
          this.book = book
        }
      })
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
