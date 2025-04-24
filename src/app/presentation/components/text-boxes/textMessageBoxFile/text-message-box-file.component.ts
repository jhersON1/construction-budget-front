import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface ITextMessageEvent {
  file: File;
  prompt?: string | null;
}

@Component({
  selector: 'app-textMessageBoxFile',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './text-message-box-file.component.html',
  styleUrl: './text-message-box-file.component.scss'
})
export class TextMessageBoxFileComponent {
  // @Input() placeholder: string = '';
  // @Output() onMessage: EventEmitter<ITextMessageEvent> = new EventEmitter<ITextMessageEvent>();

  // public fb:FormBuilder = inject(FormBuilder);
  // public form = this.fb.group({
  //   prompt: [],
  //   file: [null, Validators.required],
  // });
  // public file: File | undefined;

  // handleSelectedFile(event: any): void {
  //   const file = event.target.files.item(0);
  //   this.form.controls.file.setValue(file);
  // }

  // handleSubmit() {
  //   if (this.form.invalid) return;

  //   const { prompt, file } = this.form.value;

  //   this.onMessage.emit({ prompt, file: file! });
  //   this.form.reset();
  // }

    @Input() placeholder: string = '';
  @Output() onMessage: EventEmitter<ITextMessageEvent> = new EventEmitter<ITextMessageEvent>();

  public fb: FormBuilder = inject(FormBuilder);
  public form = this.fb.group({
    prompt: [],
    file: [null, Validators.required],
  });

  // Para la mini-vista
  public previewUrl: string | null = null;

  handleSelectedFile(event: any): void {
    const file = event.target.files.item(0);
    if (!file) {
      this.removeFile();
      return;
    }
    this.form.controls.file.setValue(file);
    // Genera URL para vista previa
    this.previewUrl = URL.createObjectURL(file);
  }

  removeFile(): void {
    this.form.controls.file.reset();
    this.previewUrl = null;
  }

  handleSubmit() {
    if (this.form.invalid) return;

    const { prompt, file } = this.form.value;
    this.onMessage.emit({ prompt, file: file! });

    // limpia todo
    this.form.reset();
    this.previewUrl = null;
  }
}
