import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { valueTypes } from '../dashboard.service';
import { DashboardEditorService } from '../dashboard-editor.service';
import { Dashboard } from '../types/dashboard';
import { DashboardGroup } from '../types/dashboard-group';
import { DashboardGroupItem } from '../types/dashboard-group-item';
import { ComponentDefinition, TagDefinition, TagValue } from '@intelligentplant/data-core-types';
import { RealTimeDataService } from '../../real-time-data.service';
import { TagSearchService } from '../../tag-search/tag-search.service';

@Component({
  selector: 'app-dashboard-editor',
  templateUrl: './dashboard-editor.component.html',
  styleUrls: ['./dashboard-editor.component.scss']
})
export class DashboardEditorComponent implements OnInit, OnDestroy {

  form: FormGroup;
  get dashboardGroups(): FormArray {
    return this.form.get('groups') as FormArray;
  }
  isTagBrowserVisible: boolean;
  dataSources: ComponentDefinition[] = [];
  private _activeGroupIndex: number;


  constructor(
    private _formBuilder: FormBuilder,
    private _editorSvc: DashboardEditorService,
    private _rtSvc: RealTimeDataService,
    private _tagSearchService: TagSearchService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this._tagSearchService.active.subscribe(x => {
      this.isTagBrowserVisible = x;
    });
    this._rtSvc.getDataSources().subscribe(x => this.dataSources = x);
    this._editorSvc.beforeSave = () => {
      this.form.updateValueAndValidity();
      if (!this.form.valid) {
        return false;
      }

      this.submit();
      return true;
    };
    this.resetFormData();
  }

  ngOnDestroy() {
    this._editorSvc.beforeSave = null;
  }

  private createForm(): void {
    this.form = this._formBuilder.group({
      details: this._formBuilder.group({
        name: ['', Validators.required],
        description: [''],
        updateRate: [15, Validators.compose([Validators.required, Validators.min(1)])]
      }),
      groups: this._formBuilder.array([])
    });

    this.form.statusChanges.subscribe(() => {
      this._editorSvc.dirty = this._editorSvc.dirty || this.form.dirty || this.form.touched;
    });

    this.form.valueChanges.subscribe(() => {
      this._editorSvc.dirty = this._editorSvc.dirty || this.form.dirty || this.form.touched;
    });
  }


  private addGroups(dashboard: Dashboard): void {
    this.form.setControl('groups', this._formBuilder.array([]));
    if (dashboard && dashboard.groups) {
      dashboard.groups.forEach(g => this.addGroup(g));
    }
  }


  addGroup(group?: DashboardGroup): void {
    const ctrl = this._formBuilder.group({
      name: [group && group.name ? group.name : 'Untitled Group', Validators.required],
      items: this._formBuilder.array([])
    });

    if (group && group.items) {
      group.items.forEach(item => this.addItemToGroup(ctrl, item));
    }

    this.dashboardGroups.push(ctrl);
  }


  deleteGroup(index: number): void {
    if (this.dashboardGroups.length === 1) {
      alert('Unable to delete: your dashboard must include at least one tag group.');
      return;
    }

    if (confirm('Delete this dashboard tag group?')) {
      this.dashboardGroups.removeAt(index);
    }
  }


  private addItemToGroup(group: FormGroup, item: DashboardGroupItem): void {
    const items = group.get('items') as FormArray;
    const ctrl = this._formBuilder.group({
      dsn: [item && item.dsn ? item.dsn : ''],
      tag: [item && item.tag ? item.tag : ''],
      description: [item && item.description ? item.description : ''],
      displayName: [item && item.displayName ? item.displayName : ''],
      subscriptions: this._formBuilder.group({
        snapshot: [item.subscriptions.indexOf(valueTypes.snapshot.name) >= 0],
        avg24: [item.subscriptions.indexOf(valueTypes.dailyAverage.name) >= 0]
      })
    });

    items.push(ctrl);
  }


  addTagsToGroup(index: number): void {
    this._activeGroupIndex = index;
    this.showTagBrowser();
  }


  showTagBrowser(): void {
    this._tagSearchService.reset();
    this._tagSearchService.open();
  }


  hideTagBrowser(): void {
    this._tagSearchService.close();
  }


  hideTagBrowserAndAddTags(): void {
    if (this._activeGroupIndex >= 0) {
      const grp = this.dashboardGroups.at(this._activeGroupIndex) as FormGroup;
      if (grp) {
        this._tagSearchService.selectedTags.forEach((x: any) => {
          this.addItemToGroup(grp, {
            dsn: x._dsn,
            tag: x.Name,
            description: x.Description,
            subscriptions: [
              valueTypes.snapshot.name
            ]
          });
          this._editorSvc.dirty = true;
        });
      }
      this._activeGroupIndex = -1;
    }

    this.hideTagBrowser();
  }


  removeTagFromGroup(groupIndex: number, tagIndex: number): void {
    if (confirm('Remove this tag from the dashboard?')) {
      const tags = this.dashboardGroups.at(groupIndex).get('items') as FormArray;
      tags.removeAt(tagIndex);
    }
  }


  private resetFormData(): void {
    this.form.reset({
      details: {
        name: this._editorSvc.dashboard.name,
        description: this._editorSvc.dashboard.description,
        updateRate: this._editorSvc.dashboard.updateRate
      }
    });

    this.addGroups(this._editorSvc.dashboard);
  }


  private prepareSaveData(): Dashboard {
    const formModel = this.form.value;

    const result: Dashboard = {
      name: formModel.details.name,
      description: formModel.details.description,
      updateRate: formModel.details.updateRate,
      groups: []
    };

    const groups = formModel.groups as any[];
    groups.forEach(grp => {
      const items: DashboardGroupItem[] = [];
      const formItems = grp.items as any[];

      formItems.forEach(i => {
        const subsForItem: string[] = [];
        if (i.subscriptions.snapshot) {
          subsForItem.push(valueTypes.snapshot.name);
        }
        if (i.subscriptions.avg24) {
          subsForItem.push(valueTypes.dailyAverage.name);
        }

        items.push({
          dsn: i.dsn,
          tag: i.tag,
          displayName: i.displayName,
          description: i.description,
          subscriptions: subsForItem
        });
      });

      result.groups.push({
        name: grp.name,
        items: items
      });
    });

    return result;
  }


  submit(): void {
    const result = this.prepareSaveData();
    this._editorSvc.dashboard = result;
  }

}
