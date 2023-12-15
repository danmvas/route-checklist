import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  url = environment.api;

  constructor(private httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  getRoute(route: string) {
    return this.httpClient.get(this.url + '?q=' + route);
  }
}
