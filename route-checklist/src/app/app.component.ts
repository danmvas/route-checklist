import { Component, OnInit } from '@angular/core';
import { SearchComponent } from './components/search/search.component';
import { TableComponent } from './components/table/table.component';
import { MapComponent } from './components/map/map.component';

@Component({
  selector: 'app-root',
  standalone: true,
  styleUrl: './app.component.css',
  providers: [],
  templateUrl: './app.component.html',
  imports: [SearchComponent, TableComponent, MapComponent],
})
export class AppComponent implements OnInit {
  title = 'Checklist de Rotas';

  constructor() {}

  ngOnInit() {}
}
