import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EndpointService {
  private baseUrl = 'https://arscanner.herokuapp.com/api'
  constructor() { }

  public getBooksEndpoint() {
    return `${this.baseUrl}/books`
  }

}
