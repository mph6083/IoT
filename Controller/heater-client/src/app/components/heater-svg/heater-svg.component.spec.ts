import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaterSvgComponent } from './heater-svg.component';

describe('HeaterSvgComponent', () => {
  let component: HeaterSvgComponent;
  let fixture: ComponentFixture<HeaterSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaterSvgComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaterSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
