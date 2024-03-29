import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { Book, setLexileMap } from 'src/app/models/book';
import { BookService } from 'src/app/services/book/book.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
})
export class BookPage implements OnInit, OnDestroy {
  public book: Book
  public isFavorited = false;
  public isOnBookSelf = false;
  public lexileMap = setLexileMap();
  private unsubscribe = new Subject<void>();

  constructor(private bookService: BookService, private storageService: StorageService) { }

  ngOnInit() {
    this.bookService.selectedBook$.pipe(takeUntil(this.unsubscribe))
      .subscribe(book => {
        if (book !== null) {
          this.book = book;
          console.log(book);
          this.storageService.favoritedBooks$.pipe(takeUntil(this.unsubscribe)).subscribe(favoritedBooks => {
            if (favoritedBooks) {
              this.isFavorited = favoritedBooks.find(b => b.title === this.book.title) ? true : false;
            }
          });
          this.storageService.bookShelf$.pipe(takeUntil(this.unsubscribe)).subscribe(bookSelfBooks => {
            if (bookSelfBooks) {
              this.isOnBookSelf = bookSelfBooks.find(b => b.title === this.book.title) ? true : false;
            }
          });
          this.storageService.addToRecents(this.book);
        }
      })
  }

  public addToBookShelf() {
    this.storageService.addToBookSelf(this.book);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
