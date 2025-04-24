import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface IOption {
  id: string;
  text: string;
}

export interface ITextMessageBoxEvent {
  prompt: string;
  selectedOption: string;
}

@Component({
  selector: 'app-text-message-box-select',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './text-message-box-select.component.html',
  styleUrl: './text-message-box-select.component.scss'
})
export class TextMessageBoxSelectComponent {
  @Input() placeholder: string = '';
  @Input({ required: true }) options!: IOption[];

  @Output() onMessage: EventEmitter<ITextMessageBoxEvent> = new EventEmitter<ITextMessageBoxEvent>();

  public fb:FormBuilder = inject(FormBuilder);
  public form = this.fb.group({
    prompt: ['', Validators.required],
    selectedOption: ['', Validators.required],
  });

  handleSubmit() {
    if (this.form.invalid) return;

    const { prompt, selectedOption } = this.form.value;

    this.onMessage.emit({ prompt: prompt!, selectedOption: selectedOption! });
    this.form.reset();
  }
}
