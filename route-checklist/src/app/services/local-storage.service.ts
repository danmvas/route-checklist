import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { TableItem } from 'models/table-item';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  routeArray: TableItem[] = [];
  key = 'routeArray';

  constructor(@Inject(DOCUMENT) private document: Document) {
    const localStorage = document.defaultView?.localStorage;

    localStorage
      ? (this.routeArray = JSON.parse(localStorage.getItem(this.key)!)! || [])
      : (this.routeArray = []);
  }

  getItemFromLocalStorage(index: number) {
    return localStorage.getItem(this.key[index]);
  }

  setLocalStorage(): void {
    localStorage.setItem(this.key, JSON.stringify(this.routeArray));
  }
}
