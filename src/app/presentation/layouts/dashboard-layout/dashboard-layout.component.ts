import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { SidebarMenuItemComponent } from '../../components/sidebar-menu-item/sidebar-menu-item.component';
import { routes } from '../../../app.routes';
import { MessageService, Thread } from 'app/presentation/services/message.service';
import { Message, OpenAiService } from 'app/presentation/services/openai.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    CommonModule,
    RouterModule,
    SidebarMenuItemComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardLayoutComponent {
  public routes = routes[0].children?.filter((route) => route.data);
  private messageService = inject(MessageService);
  public threads = this.messageService.threads;
  private openAiService = inject(OpenAiService);

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
    const assistantMsgs = all.filter(m => m.isGpt);
    if (!assistantMsgs.length) {
      console.warn('No hay mensajes de assistant para convertir');
      return;
    }
    const last = assistantMsgs[assistantMsgs.length - 1];
    // Preparamos el payload según la interfaz del servicio
    const payload: Message[] = [
      { role: 'assistant', content: [last.text] }
    ];
    this.openAiService.convertTextToJson(payload)
      .subscribe({
        next: json => console.log('JSON generado:', json),
        error: err => console.error('Error al convertir:', err)
      });
  }
}
