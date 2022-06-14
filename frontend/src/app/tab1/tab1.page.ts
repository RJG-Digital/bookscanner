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
        console.log(barcodeData.text);
        this.bookService.getBookData(barcodeData.text).pipe(take(1))
          .subscribe(data => {
            if (data) {
              console.log(data);
              this.bookService.selectedBook$.next(data);
              this.router.navigate(['book']);
            }
          });
      })
  }
}
