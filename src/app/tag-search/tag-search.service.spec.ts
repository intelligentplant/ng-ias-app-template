import { TestBed } from '@angular/core/testing';

import { TagSearchService } from './tag-search.service';

describe('TagSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TagSearchService = TestBed.get(TagSearchService);
    expect(service).toBeTruthy();
  });
});
