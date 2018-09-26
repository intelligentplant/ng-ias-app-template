import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { CanComponentDeactivate } from '../can-deactivate.guard';
import { Dashboard } from './types/dashboard';
import { DashboardService, valueTypes, DashboardDescriptor } from './dashboard.service';
import { Subscription } from 'rxjs';
import { DashboardEditorService } from './dashboard-editor.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [
    DashboardService,
    DashboardEditorService
  ]
})
export class DashboardComponent implements OnInit, OnDestroy, CanComponentDeactivate {

  dashboards: DashboardDescriptor[] = [];

  private _dashboardId: string;
  get dashboardId(): string {
    return this._dashboardId;
  }
  set dashboardId(value: string) {
    this._dashboardId = value;
    this.onDashboardSelected(this._dashboardId);
  }

  private _dashboard: Dashboard;
  get dashboard(): Dashboard {
    return this._dashboard;
  }
  set dashboard(value: Dashboard) {
    if (this._dashboardSubscription) {
      this._dashboardSubscription.unsubscribe();
      this._dashboardSubscription = null;
    }

    this._dashboard = value;
    if (this._dashboard) {
      this._dashboardSubscription = this._dashboardService.runDashboard(
        this._dashboard,
        this._dashboard.updateRate
          ? this._dashboard.updateRate
          : 15000,
        null);
    }
  }

  private _dashboardSubscription: Subscription;

  get editMode(): boolean {
    const result = this._editorService.editMode;
    if (result && this._dashboardSubscription) {
      this._dashboardSubscription.unsubscribe();
      this._dashboardSubscription = null;
    }
    return result;
  }

  constructor(private _dashboardService: DashboardService, private _editorService: DashboardEditorService) { }

  ngOnInit() {
    this._dashboardService.dashboards.subscribe(x => this.dashboards = x);
  }


  ngOnDestroy() {
    if (this._dashboardSubscription) {
      this._dashboardSubscription.unsubscribe();
      this._dashboardSubscription = null;
    }
  }


  canDeactivate(): boolean {
    if (this._editorService.dirty) {
      return confirm('You have unsaved changes. Continue?');
    } else {
      return true;
    }
  }


  onDashboardSelected(id: string): void {
    if (id) {
      this.dashboard = this._dashboardService.loadDashboard(id);
    } else {
      this.dashboard = null;
    }
  }


  open(id: string): void {
    this.dashboardId = id;
  }

}
