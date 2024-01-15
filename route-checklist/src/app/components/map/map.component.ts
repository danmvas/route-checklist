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
    if (this.markerArray.length > 0) {
      // se tiver algo no vetor, vai colocar os marcadores no vetor de marcadores e iniciar a visão do mapa com o primeiro marcador
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

      // pipeline de tratamento do popup
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

                x.features[0].properties.name
                  ? (this.routeArray[index].name =
                      x.features[0].properties.name)
                  : (this.routeArray[index].name =
                      x.features[0].properties.street +
                      ' ' +
                      x.features[0].properties.housenumber!);

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

      // index == 0 ? marker.setIcon(L.icon({ iconUrl: 'starter.png' })) : '';
    }
  }

  calculateRoute() {
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

        this.polyline.getBounds();

        this.mapLeaflet!.fitBounds(this.polyline.getBounds(), {
          padding: [50, 50],
        });
      });
    }
  }
}
