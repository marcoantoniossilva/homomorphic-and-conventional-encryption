import { AuthGuard } from './auth-guard';
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { MainPanelComponent } from './components/main-panel/main-panel';
import { UsersListComponent } from './components/users-list/users-list.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { CourseListComponent } from './components/course-list/course-list.component';
import { CourseFormComponent } from './components/course-form/course-form.component';
import { ResearchListComponent } from './components/research-list/research-list.component';
import { ResearchFormComponent } from './components/research-form/research-form.component';
import { ResearchAnswerComponent } from './components/research-answer/research-answer.component';
import { ResearchResultsComponent } from './components/research-results/research-results.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'admin', component: MainPanelComponent, canActivate: [AuthGuard] },
      {
        path: 'administradores',
        component: UsersListComponent,
        canActivate: [AuthGuard],
        data: { userType: 'administrador' }
      },
      {
        path: 'administradores/novo',
        component: UserFormComponent,
        canActivate: [AuthGuard],
        data: { formType: 'administrador', formAction: 'create' }
      },
      {
        path: 'administradores/:id',
        component: UserFormComponent,
        canActivate: [AuthGuard],
        data: { formType: 'administrador', formAction: 'view' }
      },
      {
        path: 'administradores/editar/:id',
        component: UserFormComponent,
        canActivate: [AuthGuard],
        data: { formType: 'administrador', formAction: 'update' }
      },
      {
        path: 'disciplinas',
        component: CourseListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'disciplinas/novo',
        component: CourseFormComponent,
        canActivate: [AuthGuard],
        data: { formAction: 'create' }
      },
      {
        path: 'disciplinas/:id',
        component: CourseFormComponent,
        canActivate: [AuthGuard],
        data: { formAction: 'view' }
      },
      {
        path: 'disciplinas/editar/:id',
        component: CourseFormComponent,
        canActivate: [AuthGuard],
        data: { formAction: 'update' }
      },
      {
        path: 'professores',
        component: UsersListComponent,
        canActivate: [AuthGuard],
        data: { userType: 'professor' }
      },
      {
        path: 'professores/novo',
        component: UserFormComponent,
        canActivate: [AuthGuard],
        data: { formType: 'professor', formAction: 'create' }
      },
      {
        path: 'professores/:id',
        component: UserFormComponent,
        canActivate: [AuthGuard],
        data: { formType: 'professor', formAction: 'view' }
      },
      {
        path: 'professores/editar/:id',
        component: UserFormComponent,
        canActivate: [AuthGuard],
        data: { formType: 'professor', formAction: 'update' }
      },
      {
        path: 'alunos',
        component: UsersListComponent,
        canActivate: [AuthGuard],
        data: { userType: 'aluno' }
      },
      {
        path: 'alunos/novo',
        component: UserFormComponent,
        canActivate: [AuthGuard],
        data: { formType: 'aluno', formAction: 'create' }
      },
      {
        path: 'alunos/:id',
        component: UserFormComponent,
        canActivate: [AuthGuard],
        data: { formType: 'aluno', formAction: 'view' }
      },
      {
        path: 'alunos/editar/:id',
        component: UserFormComponent,
        canActivate: [AuthGuard],
        data: { formType: 'aluno', formAction: 'update' }
      },
      { path: 'pesquisas', component: ResearchListComponent, canActivate: [AuthGuard] },
      {
        path: 'pesquisas/novo', 
        component: ResearchFormComponent, 
        canActivate: [AuthGuard],
        data: { formAction: 'create' }
      },
      {
        path: 'pesquisas/:id',
        component: ResearchFormComponent,
        canActivate: [AuthGuard],
        data: { formAction: 'view' }
      },
      {
        path: 'pesquisas/editar/:id',
        component: ResearchFormComponent,
        canActivate: [AuthGuard],
        data: { formAction: 'update' }
      },
      {
        path: 'pesquisas/responder/:id',
        component: ResearchAnswerComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'pesquisas/resultados/:id',
        component: ResearchResultsComponent,
        canActivate: [AuthGuard]
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];