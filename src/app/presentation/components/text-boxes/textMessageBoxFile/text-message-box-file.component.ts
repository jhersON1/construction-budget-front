import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

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
  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  @Input() placeholder: string = '';
  @Output() onMessage = new EventEmitter<ITextMessageEvent>();
  public fb = inject(FormBuilder);
  public form = this.fb.group({
    prompt: [],
    file: [null],
  }, { validators: this.atLeastOneFieldValidator });

  public previewUrl: string | null = null;

  handleSelectedFile(event: any): void {
    const file = event.target.files?.item(0);
    if (!file) {
      this.removeFile();
      return;
    }
    this.form.controls.file.setValue(file);
    this.previewUrl = URL.createObjectURL(file);
  }

  removeFile(): void {
    this.form.controls.file.reset();
    this.previewUrl = null;

    this.fileInput.nativeElement.value = '';
  }

  handleSubmit() {
    if (this.form.invalid) return;
    const { prompt, file } = this.form.value;
    this.onMessage.emit({ prompt, file: file! });


    this.form.reset();
    this.previewUrl = null;

    this.fileInput.nativeElement.value = '';
  }

  private atLeastOneFieldValidator(group: AbstractControl): ValidationErrors | null {
    const prompt = group.get('prompt')?.value;
    const file = group.get('file')?.value;
    return prompt || file ? null : { atLeastOneRequired: true };
  }
}
