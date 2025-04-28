import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarMenuItemComponent } from '../../components/sidebar-menu-item/sidebar-menu-item.component';
import { routes } from '../../../app.routes';
import {
  MessageService,
  Thread,
} from 'app/presentation/services/message.service';
import {
  Message,
  OpenAiService,
} from 'app/presentation/services/openai.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [CommonModule, RouterModule, SidebarMenuItemComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayoutComponent {
  public routes = routes[0].children?.filter((route) => route.data);
  private messageService = inject(MessageService);
  public threads = this.messageService.threads;
  private openAiService = inject(OpenAiService);
  private cdr = inject(ChangeDetectorRef);

  // Variable para controlar el estado de carga
  public isGeneratingPdf = false;

  cleanLocalStorage() {
    this.messageService.clearMessages();
  }

  newChat() {
    this.messageService.newChat();
  }

  loadChat(thread: Thread) {
    this.messageService.loadThread(thread.id);
  }

  convertLastAssistantMessage() {
    const all = this.messageService.messages();
    const assistantMsgs = all.filter((m) => m.isGpt);

    if (!assistantMsgs.length) {
      console.warn('No hay mensajes de assistant para convertir');
      return;
    }

    // Activar estado de carga
    this.isGeneratingPdf = true;
    this.cdr.markForCheck();

    const last = assistantMsgs[assistantMsgs.length - 1];

    // Primero convertimos el mensaje a JSON
    const payload: Message[] = [{ role: 'assistant', content: [last.text] }];

    this.openAiService.convertTextToJson(payload).subscribe({
      next: (jsonData) => {
        console.log('JSON generado:', jsonData);

        // Ahora generamos el PDF con el JSON
        this.openAiService.generatePdf(jsonData).subscribe({
          next: (pdfBlob: Blob) => {
            // Crear URL para el PDF
            const url = window.URL.createObjectURL(pdfBlob);

            // Crear enlace para descarga
            const a = document.createElement('a');
            a.href = url;
            a.download = 'presupuesto.pdf';
            document.body.appendChild(a);
            a.click();

            // Limpiar
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Desactivar estado de carga
            this.isGeneratingPdf = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error al generar PDF:', err);
            // Desactivar estado de carga en caso de error
            this.isGeneratingPdf = false;
            this.cdr.markForCheck();
          },
        });
      },
      error: (err) => {
        console.error('Error al convertir a JSON:', err);
        // Desactivar estado de carga en caso de error
        this.isGeneratingPdf = false;
        this.cdr.markForCheck();
      },
    });
  }
}
