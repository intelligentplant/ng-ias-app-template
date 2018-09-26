import { TestBed } from '@angular/core/testing';

import { DashboardEditorService } from './dashboard-editor.service';

describe('DashboardEditorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DashboardEditorService = TestBed.get(DashboardEditorService);
    expect(service).toBeTruthy();
  });
});
