import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortalComponent } from './portal.component';

describe('PortalComponent', () => {
  let fixture: ComponentFixture<PortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PortalComponent] }).compileComponents();

    fixture = TestBed.createComponent(PortalComponent);
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
