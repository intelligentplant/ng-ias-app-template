import { Component, OnInit, Input } from '@angular/core';
import { DashboardGroup } from '../types/dashboard-group';
import { DashboardGroupItem } from '../types/dashboard-group-item';

@Component({
  selector: 'app-dashboard-group',
  templateUrl: './dashboard-group.component.html',
  styleUrls: ['./dashboard-group.component.scss']
})
export class DashboardGroupComponent implements OnInit {

  @Input()
  group: DashboardGroup;

  constructor() { }

  ngOnInit() {
  }

  getRows(items: DashboardGroupItem[]): DashboardGroupItem[][] {
    const result: DashboardGroupItem[][] = [];

    let currentRow = 0;

    items.forEach((item) => {
      if (!result[currentRow]) {
        result[currentRow] = [];
      }
      result[currentRow].push(item);
      if (result[currentRow].length >= 4) {
        ++currentRow;
      }
    });

    return result;
  }

}
