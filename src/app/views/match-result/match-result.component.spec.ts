import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchResultComponent } from './match-result.component';

describe('MatchResultComponent', () => {
  let component: MatchResultComponent;
  let fixture: ComponentFixture<MatchResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
