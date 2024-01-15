import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { AppService } from 'services/app.service';
import { HttpClientModule } from '@angular/common/http';
import { Feature } from 'models/photon';
import LType from 'leaflet';
import { MapComponent } from 'components/map/map.component';
import { Observable, concatMap, debounceTime, map, tap } from 'rxjs';
import { TableComponent } from 'components/table/table.component';
import { LocalStorageService } from 'services/local-storage.service';
import { TableItem } from 'models/table-item';

declare const L: typeof LType;

@Component({
  selector: 'app-root',
  standalone: true,
  styleUrl: './app.component.css',
  providers: [],
  templateUrl: './app.component.html',
  imports: [
    TableComponent,
    MapComponent,
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
    MapComponent,
    TableComponent,
  ],
})
export class AppComponent implements OnInit {
  title = 'Checklist de Rotas';

  routeArray: TableItem[] = [];

  searchString = new FormControl<Feature>(null as any, {
    nonNullable: true,
  });

  localStorageService = inject(LocalStorageService);
  routeService = inject(AppService);

  map!: MapComponent;

  autocompleteShownOptions?: Observable<Feature[]>;

  key = 'routeArray';

  ngOnInit() {
    const localStorage = document.defaultView?.localStorage!;

    localStorage
      ? (this.routeArray = JSON.parse(localStorage.getItem(this.key)!)! || [])
      : (this.routeArray = []);

    console.log(this.routeArray);

    this.autocompleteShownOptions = this.searchString.valueChanges.pipe(
      tap(console.log),
      concatMap((value) => this.routeService.getRoutePhoton(value)),
      // tap(console.log),
      map((x) => x.features),
      debounceTime(150)
      // tap(console.log)
    );
  }

  onSubmit() {
    if (this.searchString.value) {
      var stringSubmit = this.searchString.value;

      const marker = new L.Marker([
        stringSubmit.geometry.coordinates[1], // latitude
        stringSubmit.geometry.coordinates[0], // longitude
      ]);

      this.localStorageService.routeArray.push({
        name: stringSubmit.properties.name,
        checked: true,
        latLng: marker.getLatLng(),
      });

      // this.map.addMarkerToMap(marker.getLatLng());

      this.localStorageService.setLocalStorage();

      console.log(localStorage.getItem('routeArray'));

      // this.map.calculateRoute();
    }
  }

  onDelete(position: number) {
    this.routeArray.splice(position, 1);
    this.setLocalStorage();
    this.routeArray = [...this.routeArray];
  }

  onCheckbox(position: number) {
    this.routeArray = [...this.routeArray];
    this.setLocalStorage();
  }

  displayFn(value: Feature): string {
    return value ? value.properties.name : '';
  }

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

  setLocalStorage(): void {
    console.log('jsonStringy() ', JSON.stringify(this.routeArray));
    localStorage.setItem(this.key, JSON.stringify(this.routeArray));
  }
}
