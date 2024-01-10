import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TableItem } from './models/table-item';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  Observable,
  concatMap,
  map,
  tap,
  debounceTime,
  switchMap,
  of,
  delay,
} from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AppService } from './services/app.service';
import { HttpClientModule } from '@angular/common/http';
import { decode } from '@mapbox/polyline';
import { Feature } from 'models/photon';
import { OSRM } from 'models/osrm';
import LType, { latLng } from 'leaflet';
import { subscribe } from 'diagnostics_channel';

declare const L: typeof LType;

@Component({
  selector: 'app-root',
  standalone: true,
  styleUrl: './app.component.css',
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTableModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    HttpClientModule,
  ],
  providers: [{ provide: AppService }],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'Checklist de Rotas';
  dataSource = new MatTableDataSource<TableItem>();
  columnsToDisplay: string[] = ['position', 'name', 'checked', 'actions'];

  // myControl
  searchString = new FormControl<Feature>(null as any, {
    nonNullable: true,
  });

  autocompleteShownOptions?: Observable<Feature[]>;

  polyline!: LType.Polyline;

  mapLeaflet?: LType.Map;

  routeArray: TableItem[] = [];
  markerArray: LType.Marker[] = [];

  // noMarkerArray = [{ name: String, checked: Boolean, latLng: LType.LatLng }];

  routeCalculatedOSRM?: Observable<OSRM[]>;

  constructor(private routeService: AppService) {}

  ngOnInit() {
    const localData = localStorage.getItem('routeArray');

    localData ? (this.routeArray = JSON.parse(localData)) : null;

    this.autocompleteShownOptions = this.searchString.valueChanges.pipe(
      tap(console.log),
      concatMap((value) => this.routeService.getRoutePhoton(value)),
      // tap(console.log),
      map((x) => x.features),
      debounceTime(300)
      // tap(console.log)
    );

    this.leafletInit();

    this.dataSource.data = [...this.routeArray];

    this.routeArray.forEach((element) => {
      this.addMarkerToMap(element.latLng);
    });

    // console.log('marker array!!!! ', this.markerArray);

    this.calculateRoute();
  }

  onSubmit() {
    if (this.searchString.value) {
      const stringSubmit = this.searchString.value;

      const marker = new L.Marker([
        stringSubmit.geometry.coordinates[1], // latitude
        stringSubmit.geometry.coordinates[0], // longitude
      ]);

      this.addMarkerToMap(marker.getLatLng());

      this.routeArray.push({
        name: stringSubmit.properties.name,
        checked: true,
        latLng: marker.getLatLng(),
        // marker: marker,
      });

      this.dataSource.data = [...this.routeArray];

      // this.noMarkerArray = this.routeArray.filter(
      //   (marker) => marker.name,
      //   marker.checked,
      //   marker.latLng
      // );

      localStorage.setItem('routeArray', JSON.stringify(this.routeArray));

      this.calculateRoute();
    }
  }

  onDelete(position: number) {
    // console.log('to tentando excluirrr');
    this.mapLeaflet?.removeLayer(this.markerArray[position]);
    this.routeArray.splice(position, 1);
    this.markerArray.splice(position, 1);
    this.dataSource.data = [...this.routeArray];
    this.calculateRoute();
    localStorage.setItem('routeArray', JSON.stringify(this.routeArray));
  }

  changeEvent($event: any, element: TableItem) {
    // console.log('Checkbox state changed:', $event.checked);
    element.checked = $event.checked;
    this.dataSource.data = [...this.routeArray];
    localStorage.setItem('routeArray', JSON.stringify(this.routeArray));
    this.calculateRoute();
  }

  displayFn(value: Feature): string {
    return value ? value.properties.name : '';
  }

  // clearInput() {
  //   this.searchString.setValue(null);
  // }

  buildGeocodeString(option: any) {
    if (!option || !option.properties) return '';

    const addressComponents = [
      option.properties.name,
      option.properties.street,
      option.properties.city,
      option.properties.district,
      option.properties.postcode,
      option.properties.state,
      option.properties.country,
    ];

    return addressComponents
      .filter((addressComponent) => addressComponent)
      .join(', ');
  }

  leafletInit() {
    // console.log('router array!!!! ', this.routeArray);
    if (this.markerArray.length > 0) {
      // se tiver algo no vetor, vai colocar os marcadores no vetor de marcadores e iniciar a visão do mapa com o primeiro marcador

      this.mapLeaflet = L.map('map').setView(
        [
          this.markerArray[0].getLatLng().lat,
          this.markerArray[0].getLatLng().lng,
        ],
        8
      );
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
        this.mapLeaflet
      );
      this.calculateRoute();
      // se não existir nada no vetor início padrão (londres)
    } else {
      this.mapLeaflet = L.map('map').setView([51.505, -0.09], 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
        this.mapLeaflet
      );
    }

    this.calculateRoute();
  }

  addMarkerToMap(latlng: L.LatLng) {
    if (this.mapLeaflet) {
      const marker = L.marker(latlng, {
        draggable: true,
      })
        .bindPopup(`<button class="popupButton">Excluir</button>`)
        .openPopup()
        .addTo(this.mapLeaflet!);

      this.markerArray.push(marker);
      this.calculateRoute();

      const _this = this;

      const index = this.markerArray.indexOf(marker);

      // marker
      //   .bindPopup(
      //     // <div>${this.markers.values.name}</div>
      //     `<button class="popupButton">Excluir</button>`
      //   )
      //   .openPopup();

      // document
      //   .getElementById('popupButton')!
      //   .addEventListener('click', function () {
      //     _this.onDelete(index);
      //   });

      const popupButtons = Array.from(
        document.getElementsByClassName('popupButton')
      );

      console.log(popupButtons);

      function handleButtonClick(index: number) {
        _this.onDelete(index);
      }

      // Loop through all elements with the specified class
      for (let i = 0; i < popupButtons.length; i++) {
        popupButtons[i].addEventListener(
          'click',
          handleButtonClick.bind(null, index)
        );
      }

      // fazer um escuta dos eventos
      marker.on('dragend', (event) => {
        const draggedMarker = event.target;
        const latlng = draggedMarker.getLatLng();

        this.routeService
          .getRoutePhotonReverse(latlng['lng'], latlng['lat'])
          .pipe(
            switchMap((x) => {
              this.markerArray[index].setLatLng(latlng);
              this.routeArray[index].name = x.features[0].properties.name;
              this.routeArray[index].latLng = latlng;

              this.dataSource.data = [...this.routeArray];
              localStorage.setItem(
                'routeArray',
                JSON.stringify(this.routeArray)
              );
              return of(null).pipe(delay(0));
            })
          )
          .subscribe(() => {
            this.calculateRoute();
          });
      });
    }
  }

  async calculateRoute() {
    const checkedMarkers = this.routeArray.filter((marker) => marker.checked);

    const coordinates = checkedMarkers.map((marker) => [
      marker.latLng['lng'],
      marker.latLng['lat'],
    ]);

    if (this.polyline) {
      this.mapLeaflet!.removeLayer(this.polyline);
    }

    if (coordinates.length > 1) {
      this.routeService.getRouteOSRM(coordinates).subscribe((value) => {
        if (this.polyline) {
          this.mapLeaflet!.removeLayer(this.polyline);
        }
        this.polyline = L.polyline(decode(value.routes[0].geometry));
        this.polyline.addTo(this.mapLeaflet!);

        var corner1 = L.latLng(coordinates[2][2], coordinates[2][2]),
          corner2 = L.latLng(
            coordinates[0][coordinates.length],
            coordinates[1][coordinates.length]
          ),
          bounds = L.latLngBounds(corner1, corner2);

        this.mapLeaflet!.fitBounds(bounds);
      });
    }
  }
}
