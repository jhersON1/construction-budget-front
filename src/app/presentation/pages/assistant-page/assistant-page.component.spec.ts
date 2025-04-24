import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantPageComponent } from './assistant-page.component';

describe('AssistantPageComponent', () => {
  let component: AssistantPageComponent;
  let fixture: ComponentFixture<AssistantPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssistantPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
