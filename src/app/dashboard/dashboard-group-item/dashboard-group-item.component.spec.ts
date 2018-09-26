import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGroupItemComponent } from './dashboard-group-item.component';

describe('DashboardGroupItemComponent', () => {
  let component: DashboardGroupItemComponent;
  let fixture: ComponentFixture<DashboardGroupItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardGroupItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardGroupItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
