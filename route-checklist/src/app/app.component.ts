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
import { BehaviorSubject, Observable, concatMap, filter, map, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AppService } from './services/app.service';
import { HttpClientModule } from '@angular/common/http';
import { decode } from '@mapbox/polyline';
import { Features, Photon } from 'models/photon';
import { OSRM } from 'models/osrm';
import LType from 'leaflet';

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
  searchString = new FormControl<Features | string>('', {
    nonNullable: true,
  });

  autocompleteShownOptions = new BehaviorSubject<Features[]>([]);

  markers: LType.Marker[] = [];

  mapLeaflet?: LType.Map;

  routeArray: TableItem[] = [
    // {
    //   position: 1,
    //   name: 'Route 1',
    //   checked: true,
    //   editMode: false,
    //   lat: 51.5,
    //   lon: -0.09,
    // },
    // {
    //   position: 2,
    //   name: 'Route 2',
    //   checked: false,
    //   editMode: false,
    //   lat: 52.5,
    //   lon: -0.09,
    // },
  ];

  routeCalculatedOSRM?: Observable<OSRM[]>;

  polyline?: LType.Polyline;

  constructor(private routeService: AppService) {
    this.dataSource.data = this.routeArray;
  }

  ngOnInit() {
    console.log();
    this.searchString.valueChanges
      .pipe(
        filter((x) => typeof x === 'string'),
        concatMap((value) => this.routeService.getRoutePhoton(value as string)),
        map((x) => x.features)
      )
      .subscribe(this.autocompleteShownOptions);
    this.leafletInit();
  }

  onSubmit() {
    let searchStringValue = this.searchString.value;

    if (typeof searchStringValue == 'string') {
      searchStringValue = this.autocompleteShownOptions.getValue()[0];
    }

    if (typeof searchStringValue == 'undefined') {
      alert('Please select a valid location.');
      return;
    }

    this.routeArray.push({
      position: this.routeArray.length + 1,
      name: searchStringValue.properties.name,
      checked: true,
      editMode: false,
      lon: searchStringValue.geometry.coordinates[0],
      lat: searchStringValue.geometry.coordinates[1],
    });

    this.addMarkerToMap(
      searchStringValue.geometry.coordinates[0], //longitude
      searchStringValue.geometry.coordinates[1] //latitude
    );
    this.dataSource.data = [...this.routeArray];
  }

  onDelete(index: number) {
    console.log('Delete');
    this.routeArray.splice(index - 1, 1);
    this.routeArray.forEach((item, i) => (item.position = i + 1));
    this.dataSource.data = [...this.routeArray];
    this.mapLeaflet?.removeLayer(this.markers[index - 1]);
    this.markers.splice(index - 1, 1);
    // this.calculateRoute();
  }

  onEditToggle(element: TableItem) {
    console.log('Edit');
    element.editMode = !element.editMode;
  }

  onEditBlur(element: TableItem) {
    element.editMode = false;
    this.dataSource.data = [...this.routeArray];
  }

  changeEvent($event: any, element: TableItem) {
    console.log('Checkbox state changed:', $event.checked);
  }

  displayFn(value: Features): string {
    return value && value.properties ? value.properties.name : '';
  }

  // clearInput() {
  //   this.searchString.setValue(null);
  // }

  buildGeocodeString(item: Features) {
    if (!item || !item.properties) return '';
    return [item.properties.name, item.properties.type, item.properties.country]
      .filter((addressComponent) => addressComponent)
      .join(', ');
  }

  leafletInit() {
    this.mapLeaflet = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.mapLeaflet);
  }

  addMarkerToMap(lat: number, lon: number) {
    if (!this.mapLeaflet) {
      this.leafletInit();
    } else {
      const marker = L.marker([lon, lat], { draggable: true }).addTo(
        this.mapLeaflet
      );
      this.markers.push(marker);

      const markerId = this.markers.length - 1;

      marker.bindPopup(this.routeArray[markerId].name).openPopup();

      marker.on('dragend', (event) => {
        const updatedMarker = event.target;
        const newPosition = updatedMarker.getLatLng();

        console.log('The array looked like this: ', this.routeArray);
        this.reverseGeocode(newPosition.lng, newPosition.lat).subscribe(
          (value) => {
            this.routeArray[markerId].lat = newPosition.lat;
            this.routeArray[markerId].lon = newPosition.lng;
            this.routeArray[markerId].name = value;
            this.dataSource.data = [...this.routeArray];
            this.calculateRoute();
          }
        );
      });
    }
  }

  async calculateRoute() {
    const checkedMarkers = this.routeArray.filter((marker) => marker.checked);

    if (checkedMarkers.length < 2) {
      alert('Please check at least two markers to create a route.');
      return;
    }

    const coordinates = checkedMarkers.map((marker) => [
      marker.lon,
      marker.lat,
    ]);

    console.log(coordinates);

    this.routeService.getRouteOSRM(coordinates).subscribe((value) => {
      console.log(
        'Polyline decoded successfully! ' + decode(value.routes[0].geometry)
      );
      const decodedRoute = decode(value.routes[0].geometry);

      if (this.mapLeaflet) {
        if (this.polyline == undefined) {
          this.polyline = L.polyline(decodedRoute).addTo(this.mapLeaflet);
          this.mapLeaflet.fitBounds(this.polyline.getBounds());
        } else {
          this.mapLeaflet?.removeLayer(this.polyline);
          this.polyline = L.polyline(decodedRoute).addTo(this.mapLeaflet);
          this.mapLeaflet.fitBounds(this.polyline.getBounds());
        }
      } else {
        console.error('Map undefined.');
      }
    });
  }

  reverseGeocode(lat: number, lon: number): Observable<string> {
    return this.routeService.getRoutePhotonReverse(lat, lon).pipe(
      map((x) => x.features),
      map((value) => {
        console.log(value);
        return value[0].properties.name;
      })
    );
  }
}
