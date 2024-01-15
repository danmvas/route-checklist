import {
  Component,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MapComponent } from 'components/map/map.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TableItem } from 'models/table-item';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AppComponent } from 'app.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-table',
  standalone: true,
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
export class TableComponent {
  @Input() routeArray: TableItem[] = [];
  @Output() handleDelete = new EventEmitter<number>();
  @Output() handleCheckbox = new EventEmitter<number>();

  dataSource = new MatTableDataSource<TableItem>();

  columnsToDisplay: string[] = ['position', 'name', 'checked', 'actions'];

  ngOnChanges(changes: SimpleChanges) {
    // console.log('table component detectou mudanças');
    // console.log(changes);
    this.dataSource.data = [...this.routeArray];
  }

  onDelete(position: number) {
    this.handleDelete.emit(position);
  }

  onCheckbox(position: number) {
    this.handleCheckbox.emit(position);
  }
}
