import { Injectable } from '@angular/core';
import { Dashboard } from './types/dashboard';
import { DashboardService, DashboardDescriptor } from './dashboard.service';

@Injectable()
export class DashboardEditorService {

  id: string;
  private _dashboards: DashboardDescriptor[] = [];
  dashboard: Dashboard;
  editMode: boolean;
  dirty: boolean;

  beforeSave: () => boolean;

  constructor(private _dashboardSvc: DashboardService) {
    this._dashboardSvc.dashboards.subscribe(x => this._dashboards = x);
  }

  edit(id: string) {
    this.id = id;
    this.dashboard = this._dashboardSvc.loadDashboard(this.id);
    if (!this.dashboard) {
      const num = this._dashboards.length + 1;
      this.dashboard = {
        name: 'New dashboard ' + num,
        groups: [
          {
            name: 'Tag Group #1',
            items: []
          }
        ],
        updateRate: 60
      };
      this.dirty = true;
    }

    this.editMode = true;
  }

  cancel(): void {
    this.id = null;
    this.dashboard = null;
    this.editMode = false;
    this.dirty = false;
  }

  save(): string {
    if (this.beforeSave) {
      const canContinue = this.beforeSave();
      if (!canContinue) {
        return null;
      }
    }

    const result = this._dashboardSvc.saveDashboard(this.dashboard, this.id);
    this.editMode = false;
    this.dirty = false;

    return result;
  }

}
