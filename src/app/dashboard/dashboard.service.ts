import { Injectable } from '@angular/core';

import { Subscription, timer, merge, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { RealTimeDataService } from '../real-time-data.service';
import { Dashboard } from './types/dashboard';
import { SnapshotTagValuesDataSourceDictionary, HistoricalTagValuesDataSourceDictionary } from '@intelligentplant/data-core-types';


export interface DashboardDescriptor {
  id: string;
  name: string;
  description?: string;
}


export const valueTypes = {
  snapshot: {
    name: 'NOW',
    displayName: 'Snapshot'
  },
  dailyAverage: {
    name: 'AVG24',
    displayName: '24H AVG'
  }
};


@Injectable()
export class DashboardService {

  constructor(private _rtService: RealTimeDataService) {
    this.reloadAvailableDashboards();
  }

  private _dashboards: DashboardDescriptor[] = [];
  private _dashboardsStream = new ReplaySubject<DashboardDescriptor[]>(1);
  dashboards = this._dashboardsStream.asObservable();


  private reloadAvailableDashboards(): void {
    const dashboards = localStorage.getItem('dashboards');
    if (!dashboards) {
      this._dashboards = [];
    } else {
      this._dashboards = JSON.parse(dashboards) as DashboardDescriptor[];
    }
    this._dashboardsStream.next(this._dashboards);
  }


  private addDashboardDescriptor(desc: DashboardDescriptor): void {
    const existing = this._dashboards.find(x => x.id === desc.id);

    if (existing) {
      existing.name = desc.name;
      existing.description = desc.description;
    } else {
      this._dashboards.push(desc);
    }

    this._dashboards = this._dashboards.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    });
    localStorage.setItem('dashboards', JSON.stringify(this._dashboards));
    this._dashboardsStream.next(this._dashboards);
  }


  private removeDashboardDescriptor(id: string): boolean {
    const index = this._dashboards.findIndex(x => x.id === id);

    if (index >= 0) {
      this._dashboards.splice(index, 1);
      localStorage.setItem('dashboards', JSON.stringify(this._dashboards));
      this._dashboardsStream.next(this._dashboards);
      return true;
    }

    return false;
  }


  loadDashboard(id: string): Dashboard {
    const dashboardJson = localStorage.getItem('dashboard-' + id);
    if (!dashboardJson) {
      return null;
    }

    return JSON.parse(dashboardJson) as Dashboard;
  }


  saveDashboard(dashboard: Dashboard, id: string): string {
    if (!id) {
      id = '' + new Date().valueOf();
    }
    dashboard.id = id;

    const descriptor: DashboardDescriptor = {
      id: id,
      name: dashboard.name,
      description: dashboard.description
    };
    this.addDashboardDescriptor(descriptor);
    localStorage.setItem('dashboard-' + id, JSON.stringify(dashboard));

    return id;
  }


  deleteDashboard(id: string): boolean {
    const deleted = this.removeDashboardDescriptor(id);
    localStorage.removeItem('dashboard-' + id);

    return deleted;
  }


  private getDashboardTagMaps(dashboard: Dashboard): { [key: string]: { [dsn: string]: string[] } } {
    const result = {};

    dashboard.groups.forEach(group => {
      group.items.forEach(item => {
        item.subscriptions.forEach(sub => {
          let mapForQueryType = result[sub];
          if (!mapForQueryType) {
            mapForQueryType = {};
            result[sub] = mapForQueryType;
          }

          let tagsForDataSource: string[] = mapForQueryType[item.dsn];
          if (!tagsForDataSource) {
            tagsForDataSource = [];
            mapForQueryType[item.dsn] = tagsForDataSource;
          }

          if (!tagsForDataSource.includes(item.tag)) {
            tagsForDataSource.push(item.tag);
          }
        });
      });
    });

    return result;
  }


  private updateSnapshotDashboardValues(dashboard: Dashboard, values: SnapshotTagValuesDataSourceDictionary): void {
    dashboard.groups.forEach(group => {
      group.items.forEach(item => {
        const dsVals = values[item.dsn];
        if (!dsVals) {
          return;
        }
        const tagVal = dsVals[item.tag];
        if (!tagVal) {
          return;
        }

        if (!item.values) {
          item.values = {};
        }
        item.values[valueTypes.snapshot.name] = tagVal;
        item.lastUpdatedAt = new Date();
      });
    });
  }


  private updateHistoricalDashboardValues(dashboard: Dashboard, values: HistoricalTagValuesDataSourceDictionary, valueType: string): void {
    dashboard.groups.forEach(group => {
      group.items.forEach(item => {
        const dsVals = values[item.dsn];
        if (!dsVals) {
          return;
        }
        const tagVals = dsVals[item.tag];
        if (!tagVals) {
          return;
        }

        const tagVal = tagVals.Values.length > 0
          ? tagVals.Values[tagVals.Values.length - 1]
          : null;

        if (!tagVal) {
          return;
        }

        if (!item.values) {
          item.values = {};
        }
        item.values[valueType] = tagVal;
        item.lastUpdatedAt = new Date();
      });
    });
  }


  runDashboard(dashboard: Dashboard, updateInterval: number, onDataReceived: () => void): Subscription {
    const tagMaps = this.getDashboardTagMaps(dashboard);

    if (Object.keys(tagMaps).length === 0) {
      return new Subscription();
    }

    return timer(0, updateInterval * 1000).pipe(
      map(n => {
        const queries = [];

        const nowQueryTagMap = tagMaps[valueTypes.snapshot.name];
        if (nowQueryTagMap) {
          const nowQuery = this._rtService.getSnapshotValues(nowQueryTagMap).pipe(
            tap(vals => this.updateSnapshotDashboardValues(dashboard, vals))
          );
          queries.push(nowQuery);
        }

        const avg24QueryTagMap = tagMaps[valueTypes.dailyAverage.name];
        if (avg24QueryTagMap) {
          const avg24Query = this._rtService.getProcessedValues(avg24QueryTagMap, 'AVG', '*-1d', '*', '1d').pipe(
            tap(vals => this.updateHistoricalDashboardValues(dashboard, vals, valueTypes.dailyAverage.name))
          );
          queries.push(avg24Query);
        }

        return merge.apply(null, queries);
      }),
    ).subscribe(x => x.subscribe(() => {
      if (onDataReceived) {
        onDataReceived();
      }
    }));
  }

}
