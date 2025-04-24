import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-textMessageBox',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './text-message-box.component.html',
  styleUrl: './text-message-box.component.scss'
})
export class TextMessageBoxComponent {
  @Input() placeholder: string = '';
  @Input() disableCorrections: boolean = false;
  @Output() onMessage: EventEmitter<string> = new EventEmitter<string>();

  public fb:FormBuilder = inject(FormBuilder);
  public form = this.fb.group({
    prompt: ['', Validators.required],
  });

  handleSubmit() {
    if (this.form.invalid) return;

    const { prompt } = this.form.value;

    this.onMessage.emit(prompt ?? '');
    this.form.reset();
  }
}
