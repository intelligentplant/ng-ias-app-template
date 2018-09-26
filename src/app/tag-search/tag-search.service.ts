import { Injectable } from '@angular/core';
import { TagSearchFilter, TagDefinition, ComponentDefinition } from '@intelligentplant/data-core-types';
import { RealTimeDataService } from '../real-time-data.service';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TagSearchService {

  private _active: boolean;
  private _activeStream = new Subject<boolean>();
  active = this._activeStream.asObservable();

  dataSourceName: string;
  filter: TagSearchFilter;
  selectedTags: TagDefinition[];

  constructor(private _rtSvc: RealTimeDataService) {
    this.reset();
  }

  findTags(): Observable<TagDefinition[]> {
    return this._rtSvc.findTags(this.dataSourceName, this.filter).pipe(
      tap((tags: any[]) => {
        tags.forEach(x => x._dsn = this.dataSourceName);
      })
    );
  }

  reset(): void {
    this.filter = {
      pageSize: 5,
      page: 1
    };
    this.selectedTags = [];
  }

  open(): void {
    this._active = true;
    this._activeStream.next(this._active);
  }

  close(): void {
    this._active = false;
    this._activeStream.next(this._active);
  }
}
