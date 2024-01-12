import {
  Component,
  OnInit,
  inject,
  OnChanges,
  Input,
  SimpleChanges,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MapComponent } from 'components/map/map.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TableItem } from 'models/table-item';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AppService } from 'services/app.service';
import { LocalStorageService } from 'services/local-storage.service';
import { AppComponent } from 'app.component';
import { Observable, Subject, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

// PARENT

@Component({
  selector: 'app-table',
  standalone: true,
  // providers: [AppService, LocalStorageService],
  imports: [
    MapComponent,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
    MatTableModule,
    AppComponent,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnInit {
  dataSource = new MatTableDataSource<TableItem>();

  changeLog: string[] = [];

  columnsToDisplay: string[] = ['position', 'name', 'checked', 'actions'];

  localStorageService = inject(LocalStorageService);
  routeService = inject(AppService);

  ngOnInit() {
    this.updateTable();
  }

  async changeEvent($event: any, element: TableItem) {
    element.checked = $event.checked;
    this.updateTable();
    // this.map.calculateRoute();
  }

  async onDelete(position: number) {
    console.log('yoo');
    // this.map.mapLeaflet?.removeLayer(this.map.markerArray[position]);
    // this.map.markerArray.splice(position, 1);
    this.localStorageService.routeArray.splice(position, 1);
    console.log('aaaaaaaaaaaaaa');
    this.updateTable();
    // this.map.calculateRoute();
  }

  updateTable() {
    this.dataSource.data = [...this.localStorageService.routeArray];
    this.localStorageService.setLocalStorage();
  }
}
