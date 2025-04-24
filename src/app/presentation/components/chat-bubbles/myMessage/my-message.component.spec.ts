import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMessageComponent } from './my-message.component';

describe('MyMessageComponent', () => {
  let component: MyMessageComponent;
  let fixture: ComponentFixture<MyMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
