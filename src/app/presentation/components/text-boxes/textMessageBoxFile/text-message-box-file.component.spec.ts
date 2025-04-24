import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextMessageBoxFileComponent } from './text-message-box-file.component';

describe('TextMessageBoxFileComponent', () => {
  let component: TextMessageBoxFileComponent;
  let fixture: ComponentFixture<TextMessageBoxFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextMessageBoxFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TextMessageBoxFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
