import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Book } from '../models/book';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit, OnDestroy {

  public books: Book[] = [];
  private unsubscribe = new Subject<void>();

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    this.storageService.bookShelf$
    .pipe(takeUntil(this.unsubscribe))
    .subscribe(books => {
      if(books && books.length) {
        this.books = books;
      }
    });
  }
  public markTestTaken(book: Book) {
    this.storageService.updateIsRead(book.title, true);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
