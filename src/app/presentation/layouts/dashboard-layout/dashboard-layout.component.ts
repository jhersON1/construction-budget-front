import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { SidebarMenuItemComponent } from '../../components/sidebar-menu-item/sidebar-menu-item.component';
import { routes } from '../../../app.routes';
import { MessageService, Thread } from 'app/presentation/services/message.service';

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
  public routes = routes[0].children?.filter( (route) => route.data);
  private messageService = inject(MessageService);
  public threads = this.messageService.threads;

  cleanLocalStorage() {
    this.messageService.clearMessages();
  }

  newChat() {
    this.messageService.newChat();
  }


  loadChat(thread: Thread) {
    this.messageService.loadThread(thread.id);
  }
  
}
