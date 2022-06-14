import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http'
import { EndpointService } from '../endpoint/endpoint.service';
import { Book } from 'src/app/models/book';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  public selectedBook$ = new Subject<Book>()

  private endpoint = ''
  constructor(private endpointService: EndpointService, private http: HttpClient) {
    this.endpoint = this.endpointService.getBooksEndpoint();
  }

  public getBookData(isbn: string): Observable<Book> {
    return this.http.get<Book>(`${this.endpoint}/${isbn}`);
  }
}
