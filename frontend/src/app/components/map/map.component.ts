import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { TableItem } from 'models/table-item';
import { switchMap, of, delay } from 'rxjs';
import { decode } from '@mapbox/polyline';
import { AppService } from 'services/app.service';
import { TableComponent } from 'components/table/table.component';
import LType from 'leaflet';
import { StorageService } from 'services/storage.service';
declare const L: typeof LType;

@Component({
  selector: 'app-map',
  standalone: true,
  providers: [AppService],
  imports: [TableComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit {
  @Input() routeArray: TableItem[] = [];
  @Output() handleDelete = new EventEmitter<number>();

  polyline!: LType.Polyline;

  mapLeaflet!: LType.Map;

  markerArray: LType.Marker[] = [];

  popupButtonArray: HTMLElement[] = [];

  routeService = inject(AppService);
  storageService = inject(StorageService);

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes);
    // console.log('map component detectou mudanças');
    this.markerArray.forEach((marker) => {
      this.mapLeaflet.removeLayer(marker);
    });

    this.markerArray = [];

    this.routeArray.forEach((element) => {
      this.addMarkerToMap(element.latLng);
    });

    this.calculateRoute();
  }

  ngOnInit() {
    this.leafletInit();

    this.routeArray.forEach((element) => {
      this.addMarkerToMap(element.latLng);
    });

    this.calculateRoute();
  }

  onDelete(position: number) {
    console.log('deletando pelo popup');
    this.handleDelete.emit(position);
    console.log(position);
  }

  leafletInit() {
    this.mapLeaflet = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      this.mapLeaflet
    );
  }

  addMarkerToMap(latlng: L.LatLng) {
    if (this.mapLeaflet) {
      const marker = L.marker(latlng, {
        draggable: true,
      }).addTo(this.mapLeaflet);

      this.markerArray.push(marker);

      var index = this.markerArray.indexOf(marker);

      // pipeline de tratamento do popup
      marker
        .bindPopup((layer: LType.Layer) => {
          var popupDiv = document.createElement('div');
          popupDiv.innerHTML = `<h4 style="text-align:center;margin-bottom:1px">
                        ${this.routeArray[index].name}</h4>
                        <button style="width:100%">Excluir</button>`;

          popupDiv.getElementsByTagName('button').item(0)!.onclick = () => {
            this.onDelete(index);
          };

          return popupDiv;
        })
        .openPopup()
        // pipeline de funções quando se arrasta o marcador
        .on('dragend', (event) => {
          const draggedMarker = event.target;
          const latlng = draggedMarker.getLatLng();

          this.routeService
            .getRoutePhotonReverse(latlng['lng'], latlng['lat'])
            .pipe(
              switchMap((x) => {
                this.markerArray[index].setLatLng(latlng);
                this.routeArray[index].latLng = latlng;

                if (x.features[0].properties.name) {
                  this.routeArray[index].name = x.features[0].properties.name;
                  this.storageService
                    .patch(this.routeArray[index].id, {
                      name: x.features[0].properties.name,
                      lat: latlng['lat'],
                      lng: latlng['lng'],
                    })
                    .subscribe();
                } else {
                  this.routeArray[index].name =
                    x.features[0].properties.street +
                    ' ' +
                    x.features[0].properties.housenumber!;

                  this.storageService
                    .patch(this.routeArray[index].id, {
                      name:
                        x.features[0].properties.street +
                        ' ' +
                        x.features[0].properties.housenumber!,
                      lat: latlng['lat'],
                      lng: latlng['lng'],
                    })
                    .subscribe();
                }

                return of(null).pipe(delay(0));
              })
            )
            .subscribe(() => {
              this.calculateRoute();
            });
        });

      // index == 0 ? marker.setIcon(L.icon({ iconUrl: 'starter.png' })) : '';
    }
  }

  calculateRoute() {
    const checkedMarkers = this.routeArray.filter(
      (marker) => marker.checked == 1
    );

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

        this.polyline.getBounds();

        this.mapLeaflet!.fitBounds(this.polyline.getBounds(), {
          padding: [50, 50],
        });
      });
    }
  }
}
