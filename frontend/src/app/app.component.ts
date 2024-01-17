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
import { HttpClientModule } from '@angular/common/http';
import { Observable, concatMap, debounceTime, map, tap } from 'rxjs';
import { AppService } from 'services/app.service';
import { StorageService } from 'services/storage.service';
import { MapComponent } from 'components/map/map.component';
import { TableComponent } from 'components/table/table.component';
import { TableItem } from 'models/table-item';
import { Feature } from 'models/photon';
import LType from 'leaflet';

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

  routeService = inject(AppService);
  storageService = inject(StorageService);

  map!: MapComponent;

  autocompleteShownOptions!: Observable<Feature[]>;

  id = 0;

  ngOnInit() {
    console.log('Iniciando Front...');

    this.storageService.get().subscribe((item: any) => {
      item.forEach((x: any) => {
        var latlng = L.latLng(x.lat, x.lng);
        this.routeArray.push({
          id: x.id,
          name: x.name,
          checked: x.checked,
          latLng: latlng,
        });
      });
    });

    this.getAutoCompleteOptions();
  }

  onSubmit() {
    if (this.searchString.value) {
      var stringSubmit = this.searchString.value;

      if (stringSubmit.properties == undefined) {
        alert('Selecione um local válido');
        return;
      }

      const marker = new L.Marker([
        stringSubmit.geometry.coordinates[1], // latitude
        stringSubmit.geometry.coordinates[0], // longitude
      ]);

      this.storageService
        .post({
          name: stringSubmit.properties.name,
          checked: 1,
          lat: marker.getLatLng().lat,
          lng: marker.getLatLng().lng,
        })
        .subscribe((id: any) => {
          this.routeArray.push({
            id: id,
            name: stringSubmit.properties.name,
            checked: 1,
            latLng: marker.getLatLng(),
          });
          this.routeArray = [...this.routeArray];
        });

      this.getAutoCompleteOptions();
    } else {
      alert('Selecione um local válido');
    }
  }

  getAutoCompleteOptions() {
    this.autocompleteShownOptions = this.searchString.valueChanges.pipe(
      tap(console.log),
      debounceTime(200),
      concatMap((value: string) => this.routeService.getRoutePhoton(value)),
      map((x) => x.features)
    );
  }

  onDelete(position: number) {
    this.storageService.delete(this.routeArray[position].id).subscribe();
    this.routeArray.splice(position, 1);
    this.routeArray = [...this.routeArray];
  }

  onCheckbox(position: number) {
    this.routeArray[position].checked == 1
      ? (this.routeArray[position].checked = 0)
      : (this.routeArray[position].checked = 1);

    this.routeArray = [...this.routeArray];

    this.storageService
      .patch(this.routeArray[position].id, {
        checked: this.routeArray[position].checked,
      })
      .subscribe();
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
}
