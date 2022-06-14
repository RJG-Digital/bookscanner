import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Tab1PageRoutingModule } from './tab1-routing.module';
import { BookService } from '../services/book/book.service';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab1PageRoutingModule
  ],
  providers: [
    BarcodeScanner,
    BookService
  ],
  declarations: [Tab1Page]
})
export class Tab1PageModule { }
