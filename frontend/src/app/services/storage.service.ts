import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { TableItem } from 'models/table-item';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  routesUrl = environment.routesApi;

  paramsObj = new URLSearchParams(``);

  constructor(private httpClient: HttpClient) {}

  get() {
    return this.httpClient.get(this.routesUrl);
  }

  post(routeItem: any) {
    return this.httpClient.post(this.routesUrl, routeItem);
  }

  patch(index: number, routeItem: any) {
    return this.httpClient.patch(this.routesUrl + index.toString(), routeItem);
  }

  delete(index: number) {
    return this.httpClient.delete(this.routesUrl + index.toString());
  }
}
