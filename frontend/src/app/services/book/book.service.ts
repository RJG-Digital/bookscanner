import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http'
import { EndpointService } from '../endpoint/endpoint.service';
import { Book } from 'src/app/models/book';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  public selectedBook$ = new BehaviorSubject<Book>(null);
  public bookList$ = new BehaviorSubject<Book[]>([]);

  private endpoint = ''
  constructor(private endpointService: EndpointService, private http: HttpClient) {
    this.endpoint = this.endpointService.getBooksEndpoint();
  }

  public getBookData(isbn: string): Observable<Book> {
    return this.http.get<Book>(`${this.endpoint}/${isbn}`);
  }

  public searchBookByTerm(term: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.endpoint}/search/${term}`);
  }

  public searchByTitle(title: string): Observable<Book[]> {
    return this.http.post<Book[]>(`${this.endpoint}/search/title`, { term: title });
  }

  public searchByAuthor(author: string): Observable<Book[]> {
    return this.http.post<Book[]>(`${this.endpoint}/search/author`, { term: author });
  }

  public searchByIsbn(isbn: string): Observable<Book[]> {
    return this.http.post<Book[]>(`${this.endpoint}/search/isbn`, { term: isbn });
  }
}
