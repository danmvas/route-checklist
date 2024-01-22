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

  ngOnInit() {
    const _this = this;

    const ws = new WebSocket('ws://localhost:4200/api/routes/ws');
    ws.onopen = function () {
      ws.send('Novo cliente conectado');
    };
    ws.onmessage = function (event) {
      _this.wsGetsMethod(event.data);
    };

    this.storageService.get().subscribe();

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
        .subscribe();

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
  }

  onCheckbox(position: number) {
    this.storageService
      .patch(this.routeArray[position].id, {
        checked: this.changesCheck(this.routeArray[position].checked),
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

  wsGetsMethod(data: string) {
    let method = JSON.parse(data);

    switch (method[0]) {
      case 'GET':
        if (this.routeArray.length == 0) {
          method[1].forEach((x: any) => {
            var latlng = L.latLng(x.lat, x.lng);
            this.routeArray.push({
              id: x.id,
              name: x.name,
              checked: x.checked,
              latLng: latlng,
            });
          });
        }

        this.routeArray = [...this.routeArray];
        break;

      case 'POST':
        let array_post = JSON.parse(method[2]);

        this.routeArray.push({
          id: method[1],
          name: array_post.name,
          checked: array_post.checked,
          latLng: L.latLng(array_post.lat, array_post.lng),
        });
        this.routeArray = [...this.routeArray];
        break;

      case 'PATCH':
        let array_patch = JSON.parse(method[2]);

        if (array_patch.checked == 1 || array_patch.checked == 0) {
          this.routeArray[this.findMyIndex(method)].checked =
            array_patch.checked;
        } else {
          this.routeArray[this.findMyIndex(method)].name = array_patch.name;
          this.routeArray[this.findMyIndex(method)].latLng = L.latLng(
            array_patch.lat,
            array_patch.lng
          );
        }
        this.routeArray = [...this.routeArray];
        break;

      case 'DELETE':
        this.routeArray.splice(this.findMyIndex(method), 1);
        this.routeArray = [...this.routeArray];
        break;

      default:
        console.log('Método não implementado.');
        break;
    }
  }

  findMyIndex(method: string[]): number {
    return this.routeArray.findIndex((x) => x.id == parseInt(method[1]));
  }

  changesCheck(check: number): number {
    check == 1 ? (check = 0) : (check = 1);
    return check;
  }
}
