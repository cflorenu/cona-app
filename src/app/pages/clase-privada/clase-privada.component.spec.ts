import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasePrivadaComponent } from './clase-privada.component';

describe('ClasePrivadaComponent', () => {
  let component: ClasePrivadaComponent;
  let fixture: ComponentFixture<ClasePrivadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClasePrivadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClasePrivadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
