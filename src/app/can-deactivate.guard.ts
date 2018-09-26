import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';


/**
 * Describes a component that is capable of indicating to a [[CanDeactivateGuard]] if it can be deactivated or not.
 */
export interface CanComponentDeactivate {

  /**
   * Allows a [[CanDeactivateGuard]] to test if the component can be deactivated.
   */
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}


/**
 * Deactivation guard that will only allow a component to be deactivated if the component agrees to it.
 */
@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {

  /**
   * Tests if the specified component can be deactivated.
   * @param component The component.
   */
  canDeactivate(component: CanComponentDeactivate) {
      return component && component.canDeactivate
          ? component.canDeactivate()
          : true;
  }
}
