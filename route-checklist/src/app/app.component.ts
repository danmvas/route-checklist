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
import { Observable, concatMap, map, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AppService } from './services/app.service';
import { HttpClientModule } from '@angular/common/http';
import { decode } from '@mapbox/polyline';
import { Photon } from 'models/photon';
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
  searchString = new FormControl<Photon>(null as any, {
    nonNullable: true,
  });

  autocompleteShownOptions?: Observable<Photon[]>;

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
  value: any;

  constructor(private routeService: AppService) {
    this.dataSource.data = this.routeArray;
  }

  ngOnInit() {
    console.log();

    this.autocompleteShownOptions = this.searchString.valueChanges.pipe(
      tap(console.log),
      concatMap((value) => this.routeService.getRoutePhoton(value)),
      tap(console.log),
      map((x) => x.features),
      tap(console.log)
    );
    this.leafletInit();
  }

  onSubmit() {
    if (this.searchString.value) {
      const firstFeature = this.searchString.value;

      this.routeArray.push({
        position: this.routeArray.length + 1,
        name: firstFeature.properties.name,
        checked: true,
        editMode: false,
        lon: firstFeature.geometry.coordinates[0],
        lat: firstFeature.geometry.coordinates[1],
      });

      this.addMarkerToMap(
        firstFeature.geometry.coordinates[0], // longitude
        firstFeature.geometry.coordinates[1] // latitude
      );

      this.dataSource.data = [...this.routeArray];
    }
  }

  onDelete(index: number) {
    console.log('Delete');
    this.routeArray.splice(index - 1, 1);
    this.routeArray.forEach((item, i) => (item.position = i + 1));
    this.dataSource.data = [...this.routeArray];
    this.mapLeaflet?.removeLayer(this.markers[index - 1]);
    this.markers.splice(index - 1, 1);
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

  displayFn(value: Photon): string {
    return value ? value.properties.name : '';
  }

  // clearInput() {
  //   this.searchString.setValue(null);
  // }

  buildGeocodeString(item: Photon) {
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
      marker.bindPopup(this.searchString.value.properties.name).openPopup();
      // fazer um escuta dos eventos
      marker.on('dragend', (event) => {
        const draggedMarker = event.target;
        const latlng = draggedMarker.getLatLng();
        const index = this.markers.indexOf(draggedMarker);

        if (index !== -1) {
          this.routeArray[index].lat = latlng.lat;
          this.routeArray[index].lon = latlng.lng;
          this.calculateRoute();
        }

        // geocode reverso pra atualizar lat/long e o nome na lista
        this.routeService.getRoutePhotonReverse(lat, lon).pipe(
          map((x) => x.properties),
          map((value) => {
            console.log(value);
            return value.name;
          })
        );
      });

      this.calculateRoute();
    }
  }

  async calculateRoute() {
    const checkedMarkers = this.routeArray.filter((marker) => marker.checked);
    const mapToUse = this.mapLeaflet ?? L.layerGroup();

    if (checkedMarkers.length < 2) {
      console.error('Please check at least two markers to create a route.');
      return;
    }

    const coordinates = checkedMarkers.map((marker) => [
      marker.lon,
      marker.lat,
    ]);

    console.log(coordinates);

    if (mapToUse) {
      mapToUse.eachLayer((layer) => {
        if (layer instanceof L.Polyline) {
          mapToUse.removeLayer(layer);
        }
      });
    }

    this.routeService.getRouteOSRM(coordinates).subscribe((value) => {
      console.log(decode(value.routes[0].geometry));

      L.polyline(decode(value.routes[0].geometry)).addTo(mapToUse);
    });
  }
}
