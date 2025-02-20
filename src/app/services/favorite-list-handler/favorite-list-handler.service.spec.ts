import { TestBed } from '@angular/core/testing';

import { FavoriteListHandlerService } from './favorite-list-handler.service';

describe('FavoriteListHandlerService', () => {
  let service: FavoriteListHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoriteListHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
