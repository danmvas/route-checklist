import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Photon } from 'models/photon';
import { OSRM } from 'models/osrm';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  photonUrl = environment.photonApi;
  osrmUrl = environment.osrmApi;

  paramsObj = new URLSearchParams(``);

  constructor(private httpClient: HttpClient) {}

  getRoutePhoton(route: string): Observable<Photon> {
    this.paramsObj.set('q', route);
    return this.httpClient.get<Photon>(
      this.photonUrl + '?' + this.paramsObj.toString()
    );
  }

  getRouteOSRM(coordinates: number[][]): Observable<OSRM> {
    const formattedCoordinates = coordinates
      .map((coord) => coord.join(','))
      .join(';');

    console.log(
      'estou enviando a seguinte requisição: ' +
        this.osrmUrl +
        formattedCoordinates
    );

    return this.httpClient.get<OSRM>(this.osrmUrl + formattedCoordinates);
  }
}
