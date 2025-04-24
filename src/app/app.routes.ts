import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './presentation/layouts/dashboard-layout/dashboard-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: DashboardLayoutComponent,
        children: [
            {
                path: 'assistant',
                loadComponent: () =>
                    import('./presentation/pages/assistant-page/assistant-page.component'),
                data: {
                    icon: 'fa-solid fa-user',
                    title: 'Asistente',
                    description: 'Información del asistente',
                },
            },
            {
                path: '**',
                redirectTo: 'assistant',
                pathMatch: 'full',
            },
        ]
    }
];
