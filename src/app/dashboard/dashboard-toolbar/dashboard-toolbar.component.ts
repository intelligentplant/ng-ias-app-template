import { Component, OnInit, EventEmitter, Output, Input, ElementRef, ViewChild, Renderer2, HostListener } from '@angular/core';
import { DashboardService, DashboardDescriptor } from '../dashboard.service';
import { DashboardEditorService } from '../dashboard-editor.service';

@Component({
  selector: 'app-dashboard-toolbar',
  templateUrl: './dashboard-toolbar.component.html',
  styleUrls: ['./dashboard-toolbar.component.scss']
})
export class DashboardToolbarComponent implements OnInit {

  @ViewChild('settingsMenu')
  settingsMenu: ElementRef;
  private _isSettingsMenuVisible: boolean;

  dashboards: DashboardDescriptor[] = [];
  private _selectedId: string;

  get editMode(): boolean {
    return this._editorSvc.editMode;
  }

  get editModeDirty(): boolean {
    return this.editMode && this._editorSvc.dirty;
  }

  @Input()
  set dashboard(value: string) {
    this._selectedId = value;
  }
  get dashboard(): string {
    return this._selectedId;
  }

  @Output()
  dashboardChange = new EventEmitter<string>();

  constructor(private _dashboardSvc: DashboardService, private _editorSvc: DashboardEditorService, private _renderer: Renderer2) { }

  ngOnInit() {
    this._dashboardSvc.dashboards.subscribe(x => this.dashboards = x);
  }

  toggleSettingsMenu(): void {
    if (this._isSettingsMenuVisible) {
      this.hideSettingsMenu();
    } else {
      this.showSettingsMenu();
    }
  }

  showSettingsMenu(): void {
    this._isSettingsMenuVisible = true;
    this._renderer.addClass(this.settingsMenu.nativeElement, 'is-active');
  }

  hideSettingsMenu(): void {
    this._isSettingsMenuVisible = false;
    this._renderer.removeClass(this.settingsMenu.nativeElement, 'is-active');
  }

  @HostListener('document:click', ['$event'])
  detectExternalSettingsMenuClick(event) {
    if (this.settingsMenu && this.settingsMenu.nativeElement && !this.settingsMenu.nativeElement.contains(event.target)) {
      this.hideSettingsMenu();
    }
  }

  onDashboardSelected(id: string): void {
    this._selectedId = id;
    this.dashboardChange.emit(this._selectedId);
  }

  canCreateDashboard(): boolean {
    return !this.editMode;
  }

  createDashboard(): void {
    this._editorSvc.edit(null);
  }

  canEditDashboard(): boolean {
    return this._selectedId ? true : false;
  }

  editDashboard(): void {
    if (!this.canEditDashboard()) {
      return;
    }

    this.hideSettingsMenu();

    this._editorSvc.edit(this._selectedId);
  }

  canDeleteDashboard(): boolean {
    return this._selectedId ? true : false;
  }

  deleteDashboard(): void {
    if (!this.canDeleteDashboard()) {
      return;
    }

    this.hideSettingsMenu();

    if (!confirm('Delete this dashboard?')) {
      return;
    }

    if (this._dashboardSvc.deleteDashboard(this._selectedId)) {
      if (this.dashboards.length === 0) {
        this.onDashboardSelected('');
      } else {
        this.onDashboardSelected(this.dashboards[0].id);
      }
    }

  }

  saveDashboardChanges(): void {
    if (!this.editMode) {
      return;
    }
    const id = this._editorSvc.save();
    this.onDashboardSelected(id);
  }

  discardDashboardChanges(): void {
    if (!this.editMode) {
      return;
    }
    this._editorSvc.cancel();
  }

}
