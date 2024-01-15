import { Component, Input, OnInit, inject } from '@angular/core';
import { TableItem } from 'models/table-item';
import { switchMap, of, delay } from 'rxjs';
import { decode } from '@mapbox/polyline';
import { AppService } from 'services/app.service';
import { TableComponent } from 'components/table/table.component';
import LType from 'leaflet';
import { LocalStorageService } from 'services/local-storage.service';
declare const L: typeof LType;

@Component({
  selector: 'app-map',
  standalone: true,
  providers: [AppService, LocalStorageService],
  imports: [TableComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit {
  @Input({ required: true }) routeArray: any;

  polyline!: LType.Polyline;

  mapLeaflet!: LType.Map;

  markerArray: LType.Marker[] = [];

  popupButtonArray: HTMLElement[] = [];

  table!: TableComponent;

  localStorageService = inject(LocalStorageService);
  routeService = inject(AppService);

  ngOnInit() {
    this.leafletInit();

    this.localStorageService.routeArray.forEach((element) => {
      this.addMarkerToMap(element.latLng);
    });

    this.calculateRoute();
  }

  async leafletInit() {
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

  async addMarkerToMap(latlng: L.LatLng) {
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
                        ${_this.localStorageService.routeArray[index].name}</h4>`;

          var btnLine = document.createElement('button');
          btnLine.innerHTML = 'Excluir';
          btnLine.style.width = '100%';

          btnLine.onclick = function () {
            _this.table.onDelete(index);
          };

          popupDiv.appendChild(btnLine);

          return popupDiv;
        })
        .openPopup();

      // fazer um escuta dos eventos
      marker.on('dragend', (event) => {
        const draggedMarker = event.target;
        const latlng = draggedMarker.getLatLng();

        this.routeService
          .getRoutePhotonReverse(latlng['lng'], latlng['lat'])
          .pipe(
            switchMap((x) => {
              this.markerArray[index].setLatLng(latlng);
              this.localStorageService.routeArray[index].name =
                x.features[0].properties.name;
              this.localStorageService.routeArray[index].latLng = latlng;

              localStorage.setItem(
                'routeArray',
                JSON.stringify(this.localStorageService.routeArray)
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
    const checkedMarkers = this.localStorageService.routeArray.filter(
      (marker) => marker.checked
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
