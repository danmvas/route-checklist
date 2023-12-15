import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TableItem } from './models/table-item';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, concatMap, map, startWith, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AppService } from './services/app.service';
import { HttpClient, HttpClientModule, withFetch } from '@angular/common/http';

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
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    HttpClientModule,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'Checklist de Rotas';
  dataSource = new MatTableDataSource<TableItem>();
  columnsToDisplay: string[] = ['position', 'name', 'checked', 'actions'];

  // myControl
  searchString = new FormControl();

  options: string[] = ['um', 'dois', 'tres'];
  filteredOptions?: Observable<string[]>;

  routes = [];
  routeService = new AppService(this.httpClient);

  routeArray: TableItem[] = [
    { position: 1, name: 'Route 1', checked: true, editMode: false },
    { position: 2, name: 'Route 2', checked: false, editMode: false },
  ];

  constructor(private httpClient: HttpClient) {
    this.dataSource.data = this.routeArray;
    this.httpClient = httpClient;
  }

  onSubmit() {
    console.log(this.searchString.value);
    console.log(this.routeService.getRoute(this.searchString.value));

    this.routeArray.push({
      position: this.routeArray.length + 1,
      name: this.searchString.value,
      checked: false,
      editMode: false,
    });

    this.dataSource.data = [...this.routeArray];
  }

  onDelete(index: number) {
    console.log('Delete');
    this.routeArray.splice(index - 1, 1);
    this.routeArray.forEach((item, i) => (item.position = i + 1));
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

  clearInput() {
    this.searchString.setValue(null);
  }

  ngOnInit() {
    this.filteredOptions = this.searchString.valueChanges.pipe(
      startWith(''),
      switchMap((value) => this.routeService.getRoute(value)),
      map((response) => response.toString()),
      map((options) => this._filter(options))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }
}
