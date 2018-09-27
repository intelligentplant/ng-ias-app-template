import { Component, OnInit, Input } from '@angular/core';

import * as moment from 'moment';

import { DashboardGroupItem } from '../types/dashboard-group-item';
import { valueTypes } from '../dashboard.service';
import { TagValue } from '@intelligentplant/data-core-types';

@Component({
  selector: 'app-dashboard-group-item',
  templateUrl: './dashboard-group-item.component.html',
  styleUrls: ['./dashboard-group-item.component.scss']
})
export class DashboardGroupItemComponent implements OnInit {

  @Input()
  item: DashboardGroupItem;

  constructor() { }

  ngOnInit() {
  }

  private getDisplayValue(valueType: string): string {
    const val = this.item.values
      ? this.item.values[valueType]
      : null;

    if (!val) {
      return '?';
    }

    let result;

    if (isNaN(val.NumericValue) || isNaN(parseFloat(val.TextValue))) {
      result = val.TextValue;
    } else {
      result = val.NumericValue.toFixed(1);
    }

    return val.Unit
      ? `${result} ${val.Unit}`
      : result;
  }


  getValues(): any[] {
    const result = [];
    const valueTypeEntries = Object.values(valueTypes);

    this.item.subscriptions.forEach(sub => {
      const def = valueTypeEntries.find(x => x.name === sub);
      if (!def) {
        return;
      }
      result.push({
        name: def.displayName,
        value: this.getDisplayValue(def.name)
      });
    });

    return result;
  }

  getRelativeTime(time?: Date): string {
    if (!time) {
      return 'Unknown';
    }

    return moment(time).fromNow();
  }


  getAbsoluteTime(time?: Date): string {
    if (!time) {
      return 'Unknown';
    }

    return moment(time).format('DD MMM YY HH:mm:ss');
  }

}
