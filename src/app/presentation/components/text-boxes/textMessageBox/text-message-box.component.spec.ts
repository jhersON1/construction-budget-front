import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextMessageBoxComponent } from './text-message-box.component';

describe('TextMessageBoxComponent', () => {
  let component: TextMessageBoxComponent;
  let fixture: ComponentFixture<TextMessageBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextMessageBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TextMessageBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
