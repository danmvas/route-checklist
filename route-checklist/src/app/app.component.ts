import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TableItem } from './models/table-item';
import { HttpClient } from '@angular/common/http';

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
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'Checklist de Rotas';
  searchString = '';
  dataSource = new MatTableDataSource<TableItem>();
  columnsToDisplay: string[] = ['position', 'name', 'checked', 'actions'];

  routeArray: TableItem[] = [
    { position: 1, name: 'Route 1', checked: true, editMode: false },
    { position: 2, name: 'Route 2', checked: false, editMode: false },
  ];

  constructor(private httpClient: HttpClient) {
    this.dataSource.data = this.routeArray;
    this.httpClient = httpClient;
  }

  getRoute() {}

  onSubmit() {
    console.log(this.searchString);

    this.routeArray.push({
      position: this.routeArray.length + 1,
      name: this.searchString,
      checked: false,
      editMode: false,
    });

    this.dataSource.data = [...this.routeArray];
  }

  onDelete(index: number) {
    console.log('Delete');
    this.routeArray.splice(index - 1, 1);
    this.dataSource.data = [...this.routeArray];
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

  ngOnInit() {}
}
