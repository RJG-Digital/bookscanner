import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ToastController } from '@ionic/angular';
import { BookService } from '../services/book/book.service';
import { take } from 'rxjs/operators'

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public barCodeDataText: string;
  public error: string;
  public loading = false;
  public searchText = '';
  constructor(
    private barcodeScanner: BarcodeScanner,
    private bookService: BookService,
    public toastController: ToastController,
    private router: Router
  ) { }
  public scan() {
    this.loading = true;
    this.barcodeScanner
      .scan()
      .then((barcodeData) => {
        if(barcodeData && barcodeData.text && barcodeData.text !== '') {
          this.bookService.getBookData(barcodeData.text).pipe(take(1))
          .subscribe(data => {
            if (data) {
              this.bookService.selectedBook$.next(data);
              this.router.navigate(['book']);
              this.loading = false;
              this.searchText = '';
            } else {
              this.loading = false;
              this.searchText = '';
            }
          }, async (error) => {
            if (error) {
              this.loading = false;
              const toast = await this.toastController.create({
                color: 'danger',
                message: error.error.message,
                duration: 4000
              });
              toast.present();
              this.searchText = '';
            }
          });
        } else {
          this.loading = false;
        }

      })
  }

  searchForBook() {
    this.loading = true;
    this.bookService.searchBookByTerm(this.searchText).pipe(take(1))
      .subscribe(data => {
        if (data) {
          this.bookService.bookList$.next(data);
          this.router.navigate(['book-list']);
          this.loading = false;
          this.searchText = '';
        }
      }, async (error) => {
        if (error) {
          this.loading = false;
          const toast = await this.toastController.create({
            color: 'danger',
            message: error.error.message,
            duration: 4000
          });
          toast.present();
          this.searchText = '';
          this.loading = false;
        }
      });
  }
}
