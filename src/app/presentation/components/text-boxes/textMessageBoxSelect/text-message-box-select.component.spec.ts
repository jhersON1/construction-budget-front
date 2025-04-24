import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextMessageBoxSelectComponent } from './text-message-box-select.component';

describe('TextMessageBoxSelectComponent', () => {
  let component: TextMessageBoxSelectComponent;
  let fixture: ComponentFixture<TextMessageBoxSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextMessageBoxSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TextMessageBoxSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
