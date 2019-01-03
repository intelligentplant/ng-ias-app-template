import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ComponentDefinition,
  HistoricalTagValuesDataSourceDictionary,
  SnapshotDataQuery,
  SnapshotTagValuesDataSourceDictionary,
  TagDefinition,
  TagSearchFilter,
  PlotDataQuery,
  RawDataQuery,
  ProcessedDataQuery,
} from '@intelligentplant/data-core-types';

import { AppConfigService } from './app-config.service';


@Injectable({
  providedIn: 'root'
})
export class RealTimeDataService {
  private _baseUrl: string;

  dataSource: ComponentDefinition;


  constructor(private _http: HttpClient, private _configSvc: AppConfigService) {
    this._configSvc.config.subscribe(cfg => {
      this._baseUrl = cfg.dataEndpoints
        ? cfg.dataEndpoints[0]
        : null;
    });
  }


  private throwOnNotReady(): void {
    if (!this._baseUrl) {
      throw new Error('The service is not ready.');
    }
  }


  public getDataSources(): Observable<ComponentDefinition[]> {
    this.throwOnNotReady();
    const url = `${this._baseUrl}/api/data/datasources`;
    return this._http.get<ComponentDefinition[]>(url);
  }


  public getDataSource(qualifiedDsn: string): Observable<ComponentDefinition> {
    if (this.dataSource && this.dataSource.Name.QualifiedName === qualifiedDsn) {
      return of(this.dataSource);
    }

    return this.getDataSources().pipe(
      map(x => x.find(ds => ds.Name.QualifiedName === qualifiedDsn))
    );
  }


  public findTags(qualifiedDsn: string, filter: TagSearchFilter): Observable<TagDefinition[]> {
    this.throwOnNotReady();
    filter = Object.assign({}, filter);
    if (!filter.name && !filter.description && !filter.unit) {
      filter.name = '*';
    }
    const url = `${this._baseUrl}/api/data/tags/${encodeURIComponent(qualifiedDsn)}`;
    return this._http.post<TagDefinition[]>(url, filter);
  }


  public getSnapshotValues(tagMap: { [dsn: string]: string[] }): Observable<SnapshotTagValuesDataSourceDictionary> {
    this.throwOnNotReady();
    const url = `${this._baseUrl}/api/data/v2/snapshot`;
    const query: SnapshotDataQuery = {
      tags: tagMap
    };

   return this._http.post<SnapshotTagValuesDataSourceDictionary>(url, query);
  }


  public getPlotValues(tagMap: { [dsn: string]: string[] },
                       start: string | Date,
                       end: string | Date,
                       intervals: number): Observable<HistoricalTagValuesDataSourceDictionary> {

    this.throwOnNotReady();
    const url = `${this._baseUrl}/api/data/v2/plot`;
    const query: PlotDataQuery = {
      tags: tagMap,
      startTime: start,
      endTime: end,
      intervals: intervals
    };

    return this._http.post<HistoricalTagValuesDataSourceDictionary>(url, query);
  }


  public getRawValues(tagMap: { [dsn: string]: string[] },
                      start: string | Date,
                      end: string | Date,
                      pointCount: number): Observable<HistoricalTagValuesDataSourceDictionary> {

    this.throwOnNotReady();
    const url = `${this._baseUrl}/api/data/v2/raw`;
    const query: RawDataQuery = {
      tags: tagMap,
      startTime: start,
      endTime: end,
      pointCount: pointCount
    };

    return this._http.post<HistoricalTagValuesDataSourceDictionary>(url, query);
  }


  public getProcessedValues(tagMap: { [dsn: string]: string[] },
                           dataFunction: string,
                           start: string | Date,
                           end: string | Date,
                           sampleInterval: string): Observable<HistoricalTagValuesDataSourceDictionary> {

    this.throwOnNotReady();
    const url = `${this._baseUrl}/api/data/v2/processed`;
    const query: ProcessedDataQuery = {
      tags: tagMap,
      dataFunction: dataFunction,
      startTime: start,
      endTime: end,
      sampleInterval: sampleInterval
    };

    return this._http.post<HistoricalTagValuesDataSourceDictionary>(url, query);
  }

}
