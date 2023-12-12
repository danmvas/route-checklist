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
  template: `
    <div class="container">
      <h1>{{ title }}</h1>

      <hr />

      <div class="header">
        <div>
          <mat-form-field
            appearance="outline"
            id="search-bar"
            class="example-form-field"
            required="true"
          >
            <mat-label>Insira a rota</mat-label>
            <input matInput type="text" [(ngModel)]="searchString" />
            @if (searchString) {
            <button
              matSuffix
              mat-icon-button
              aria-label="Clear"
              (click)="searchString = ''"
            >
              <mat-icon>close</mat-icon>
            </button>
            }
          </mat-form-field>
        </div>
        <div>
          <button
            (click)="onSubmit()"
            class="add-button"
            mat-raised-button
            color="primary"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div class="route-table">
        <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
          <ng-container matColumnDef="position">
            <th mat-header-cell *matHeaderCellDef>No.</th>
            <td mat-cell *matCellDef="let element">{{ element.position }}</td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nome</th>
            <td mat-cell *matCellDef="let element">
              <span *ngIf="!element.editMode">{{ element.name }}</span>
              <div *ngIf="element.editMode" class="edit-mode-container">
                <input
                  [(ngModel)]="element.name"
                  (blur)="onEditBlur(element)"
                  (keyup.enter)="onEditBlur(element)"
                  class="edit-mode"
                />
                <button mat-icon-button (click)="onEditToggle(element)">
                  <mat-icon class="edit-confirm-btn">check</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="checked">
            <th mat-header-cell *matHeaderCellDef>Completo</th>
            <td mat-cell *matCellDef="let element">
              <mat-checkbox
                class="example-margin"
                [(ngModel)]="element.checked"
                (change)="changeEvent($event, element)"
              ></mat-checkbox>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Ações</th>
            <td mat-cell *matCellDef="let element">
              <button mat-icon-button (click)="onDelete(element.position)">
                <mat-icon color="warn">delete</mat-icon>
              </button>
              <button mat-icon-button (click)="onEditToggle(element)">
                <mat-icon color="primary">edit</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columnsToDisplay"></tr>
          <tr mat-row *matRowDef="let row; columns: columnsToDisplay"></tr>
        </table>
      </div>
    </div>
  `,
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
