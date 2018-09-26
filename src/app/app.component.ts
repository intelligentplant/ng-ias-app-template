import { Component, ElementRef, ViewChild, NgZone, Renderer, AfterViewInit } from '@angular/core';
import { BusyService } from './busy.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('appIsBusy')
  appIsBusy: ElementRef;

  constructor(private _ngZone: NgZone, private _renderer: Renderer, private _busySvc: BusyService) {}

  public ngAfterViewInit() {
    this._busySvc.busy.subscribe(x => this.onBusyServiceStateChange(x));
  }

  private onBusyServiceStateChange(busy: boolean): void {
    this._ngZone.runOutsideAngular(() => {
      this._renderer.setElementClass(this.appIsBusy.nativeElement, 'visible', busy);
    });
  }
}
