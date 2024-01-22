import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Photon } from 'models/photon';
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

  patch(index: number, routeItem: Photon) {
    const params = new HttpParams().set('index', index);
    return this.httpClient.patch(
      this.routesUrl + this.paramsObj.toString(),
      routeItem,
      {
        params,
      }
    );
  }

  delete(index: number) {
    const params = new HttpParams().set('index', index);
    return this.httpClient.delete(this.routesUrl + this.paramsObj.toString(), {
      params,
    });
  }
}
