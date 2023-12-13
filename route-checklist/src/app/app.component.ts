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
import { TableItem } from './table-item';

@Component({
  selector: 'app-root',
  standalone: true,
  styleUrl: './app.component.css',
  templateUrl: './app.component.html',
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

  constructor() {
    this.dataSource.data = this.routeArray;
  }

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
    if (!element.editMode) {
      element.originalPosition = element.position;
    }
    element.editMode = !element.editMode;
  }

  onEditBlur(element: TableItem) {
    element.editMode = false;

    if (
      element.originalPosition !== undefined &&
      element.originalPosition !== element.position
    ) {
      this.routeArray.forEach((item) => {
        if (item.position === element.originalPosition) {
          item.position = element.position;
        }
      });

      this.routeArray.sort((a, b) => a.position - b.position);
      this.dataSource.data = [...this.routeArray];
    }

    element.originalPosition = undefined;
  }

  changeEvent($event: any, element: TableItem) {
    console.log('Checkbox state changed:', $event.checked);
  }

  ngOnInit() {}
}
