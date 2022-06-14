import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EndpointService {
  private baseUrl = 'http://192.168.4.103:5000/api'
  constructor() { }

  public getBooksEndpoint() {
    return `${this.baseUrl}/books`
  }

}
