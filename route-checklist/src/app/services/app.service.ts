import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { RoutePhoton } from '../models/route-photon';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  url = environment.api;

  paramsObj = new URLSearchParams(``);

  constructor(private httpClient: HttpClient) {}

  getRoute(route: string): Observable<RoutePhoton> {
    this.paramsObj.set('q', route);
    return this.httpClient.get<RoutePhoton>(
      this.url + '?' + this.paramsObj.toString()
    );
  }
}
