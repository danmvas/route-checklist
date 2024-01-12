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
import { TableItem } from 'models/table-item';
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
import { AppService } from 'services/app.service';
import { HttpClientModule } from '@angular/common/http';
import { decode } from '@mapbox/polyline';
import { Feature } from 'models/photon';
import { OSRM } from 'models/osrm';
import LType from 'leaflet';

declare const L: typeof LType;

@Component({
  selector: 'app-root',
  standalone: true,
  styleUrl: './monolith.css',
  providers: [{ provide: AppService }],
  templateUrl: './monolith.html',
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
})
export class MonolithAppComponent implements OnInit {
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

  popupButtonArray: HTMLElement[] = [];

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
      debounceTime(150)
      // tap(console.log)
    );

    this.leafletInit();

    this.dataSource.data = [...this.routeArray];

    this.routeArray.forEach((element) => {
      this.addMarkerToMap(element.latLng);
    });

    this.calculateRoute();
  }

  onSubmit() {
    if (this.searchString.value) {
      var stringSubmit = this.searchString.value;

      const marker = new L.Marker([
        stringSubmit.geometry.coordinates[1], // latitude
        stringSubmit.geometry.coordinates[0], // longitude
      ]);

      this.routeArray.push({
        name: stringSubmit.properties.name,
        checked: true,
        latLng: marker.getLatLng(),
        // marker: marker,
      });

      this.addMarkerToMap(marker.getLatLng());

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
    this.mapLeaflet?.removeLayer(this.markerArray[position]);
    this.routeArray.splice(position, 1);
    this.markerArray.splice(position, 1);
    this.dataSource.data = [...this.routeArray];
    this.calculateRoute();
    localStorage.setItem('routeArray', JSON.stringify(this.routeArray));
  }

  changeEvent($event: any, element: TableItem) {
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
      const _this = this;

      const marker = L.marker(latlng, {
        draggable: true,
      }).addTo(this.mapLeaflet);

      this.markerArray.push(marker);
      this.calculateRoute();

      var index = this.markerArray.indexOf(marker);

      marker
        .bindPopup((layer: LType.Layer) => {
          var index = this.markerArray.indexOf(marker);

          var popupDiv = document.createElement('div');
          popupDiv.innerHTML = `<h4 style="text-align:center;margin-bottom:1px">
                        ${_this.routeArray[index].name}</h4>`;

          var btnLine = document.createElement('button');
          btnLine.innerHTML = 'Excluir';
          btnLine.style.width = '100%';

          btnLine.onclick = function () {
            _this.onDelete(index);
          };

          popupDiv.appendChild(btnLine);

          return popupDiv;
        })
        .openPopup();

      // var popupButton = document.getElementById('popupButton')!;
      // this.popupButtonArray.push(popupButton);

      // console.log('this.popupButtonArray', _this.popupButtonArray[index]);

      // marker.on('click', function () {
      //   console.log('popup open');
      //   console.log('index: ', index);
      //   console.log('markerArray length: ', _this.markerArray.length);
      //   console.log(
      //     'this.popupButtonArray length',
      //     _this.popupButtonArray.length
      //   );
      //   console.log('this.popupButtonArray', _this.popupButtonArray);
      //   _this.popupButtonArray[index].addEventListener('click', function () {
      //     _this.onDelete(index);
      //   });
      // });

      // document
      //   // .getElementById('popupButton')!
      //   .getElementsByClassName('popupButton')
      //   [_this.popupButtonArray.length].addEventListener('click', function () {
      //     _this.onDelete(index);
      //   });

      // function handleButtonClick(index: number) {
      //   console.log('yipiii');
      //   _this.onDelete(index);
      // }

      // for (let i = 0; i < this.popupButtonArray.length; i++) {
      //   console.log('h-hello');
      //   this.popupButtonArray[i][0].addEventListener('click', function () {
      //     _this.onDelete(index);
      //   });
      // }

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
      });

      var corner1 = L.latLng(coordinates[0][1], coordinates[0][0]),
        corner2 = L.latLng(
          coordinates[coordinates.length - 1][1],
          coordinates[coordinates.length - 1][0]
        ),
        bounds = L.latLngBounds(corner1, corner2);

      this.mapLeaflet!.fitBounds(bounds);
    }
  }
}
