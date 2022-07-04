import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
})
export class RatingComponent implements OnInit {

  @Input() rating: string = '0.0';
  public stars: string[] = [];

  constructor() { }

  ngOnInit() {
    this.setRating();
  }

  private setRating() {
    this.stars = [];
    if (this.rating !== 'Not yet rated.') {
      const wholeNumber = parseInt(this.rating.split('.')[0]);
      const fraction = parseInt(this.rating.split('.')[1]);
      for (let i = 0; i < wholeNumber; i++) {
        this.stars.push('star');
      }
      if (fraction !== 0) {
        this.stars.push('star-half')
      }
    }
  }

}
