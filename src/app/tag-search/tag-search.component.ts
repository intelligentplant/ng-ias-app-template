import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { BehaviorSubject, merge } from 'rxjs';
import { TagDefinition, ComponentDefinition } from '@intelligentplant/data-core-types';
import { debounceTime, distinctUntilChanged, map, startWith, share, tap } from 'rxjs/operators';
import { TagSearchService } from './tag-search.service';


interface SearchFilter {
  name?: string;
  description?: string;
  units?: string;
}


@Component({
  selector: 'app-tag-search',
  templateUrl: './tag-search.component.html',
  styleUrls: ['./tag-search.component.scss']
})
export class TagSearchComponent implements OnInit {

  @Input()
  dataSources: ComponentDefinition[];

  get dataSourceName(): string {
    return this._searchSvc.dataSourceName;
  }

  @Input()
  canSelect: boolean;

  searchForm: FormGroup;
  busy: boolean;
  tags: TagDefinition[] = [];

  private _nameFilterStream = new BehaviorSubject<string>('');
  private _nameFilterStreamCurrent = '';

  private _descriptionFilterStream = new BehaviorSubject<string>('');
  private _descriptionFilterStreamCurrent = '';

  private _unitFilterStream = new BehaviorSubject<string>('');
  private _unitFilterStreamCurrent = '';

  constructor(private _formBuilder: FormBuilder, private _searchSvc: TagSearchService) {
    this.createForm();
  }

  ngOnInit() {
    const name = this._nameFilterStream.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map<string, SearchFilter>(t => {
        if (t && t !== '*') {
          t = `*${t}*`;
        }
        this._nameFilterStreamCurrent = t;
        return {
          name: this._nameFilterStreamCurrent,
          description: this._descriptionFilterStreamCurrent,
          units: this._unitFilterStreamCurrent };
      })
    );

    const desc = this._descriptionFilterStream.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map<string, SearchFilter>(t => {
        if (t && t !== '*') {
          t = `*${t}*`;
        }
        this._descriptionFilterStreamCurrent = t;
        return {
          name: this._nameFilterStreamCurrent,
          description: this._descriptionFilterStreamCurrent,
          units: this._unitFilterStreamCurrent };
      })
    );

    const units = this._unitFilterStream.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map<string, SearchFilter>(t => {
        if (t && t !== '*') {
          t = `*${t}*`;
        }
        this._unitFilterStreamCurrent = t;
        return {
          name: this._nameFilterStreamCurrent,
          description: this._descriptionFilterStreamCurrent,
          units: this._unitFilterStreamCurrent
        };
      })
    );

    const composite = merge(name, desc, units).pipe(
      distinctUntilChanged((x, y) => {
        return x.name === y.name && x.description === y.description && x.units === y.units;
      }),
      startWith({
        name: this._nameFilterStreamCurrent,
        description: this._descriptionFilterStreamCurrent,
        units: this._unitFilterStreamCurrent
      }),
      share()
    ).subscribe(f => {
      let nameFilter = f.name;
      if (!f.name && !f.description && !f.units) {
        nameFilter = '*';
      }
      this._searchSvc.filter.name = nameFilter;
      this._searchSvc.filter.description = f.description;
      this._searchSvc.filter.unit = f.units;
      this._searchSvc.filter.page = 1;
      this.search();
    });
  }

  private createForm() {
    this.searchForm = this._formBuilder.group({
      dsn: [''],
      name: [{ value: '', disabled: true }],
      description: [{ value: '', disabled: true }],
      units: [{ value: '', disabled: true }]
    });

    this.searchForm.valueChanges.subscribe(() => this.onSearchFormValueChange());
  }


  private onSearchFormValueChange(): void {
    let val: any;

    let ctrl: AbstractControl;

    ctrl = this.searchForm.get('dsn');
    val = ctrl.value;
    const triggerSearch = this._searchSvc.dataSourceName !== val;
    this._searchSvc.dataSourceName = val;

    ctrl = this.searchForm.get('name');
    if (this.dataSourceName && ctrl.disabled) {
      ctrl.enable({ emitEvent: false });
    }
    val = ctrl.value;
    if (val !== undefined && val !== null) {
        this._nameFilterStream.next('' + val);
    }

    ctrl = this.searchForm.get('description');
    if (this.dataSourceName && ctrl.disabled) {
      ctrl.enable({ emitEvent: false });
    }
    val = ctrl.value;
    if (val !== undefined && val !== null) {
        this._descriptionFilterStream.next('' + val);
    }

    ctrl = this.searchForm.get('units');
    if (this.dataSourceName && ctrl.disabled) {
      ctrl.enable({ emitEvent: false });
    }
    val = ctrl.value;
    if (val !== undefined && val !== null) {
        this._unitFilterStream.next('' + val);
    }

    if (triggerSearch) {
      this.search();
    }
  }


  private search(): void {
    if (!this._searchSvc.dataSourceName) {
      return;
    }

    this.busy = true;
    this._searchSvc.findTags()
      .subscribe(tags => {
        this.tags = tags;
        this.busy = false;
      });
  }


  canPageNext(): boolean {
    return !this.busy && this.tags.length === this._searchSvc.filter.pageSize;
  }


  pageNext(): void {
    if (this.canPageNext()) {
      this._searchSvc.filter.page++;
      this.search();
    }
  }


  canPagePrevious(): boolean {
    return !this.busy && this._searchSvc.filter.page > 1;
  }


  pagePrevious(): void {
    if (this.canPagePrevious()) {
      this._searchSvc.filter.page--;
      this.search();
    }
  }


  isTagSelected(tag: any): boolean {
    return this._searchSvc.selectedTags.findIndex((t: any) => t._dsn === tag._dsn && t.Name === tag.Name) >= 0;
  }


  selectTag(tag: any, ctrl: any): void {
    if (ctrl.checked) {
      this._searchSvc.selectedTags.push(tag);
    } else {
      const idx = this._searchSvc.selectedTags.findIndex((t: any) => t._dsn === tag._dsn && t.Name === tag.Name);
      if (idx >= 0) {
        this._searchSvc.selectedTags.splice(idx);
      }
    }
  }


  close() {
    this._searchSvc.close();
  }

}
