import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Activate } from './pages/activate/activate';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';
import { MainLayout } from './layout/main-layout/main-layout';
import { Feed } from './pages/feed/feed';
import { Perfil } from './pages/perfil/perfil';
import { Agenda } from './pages/agenda/agenda';
import { AuthCallback } from './pages/auth-callback/auth-callback';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'activate', component: Activate },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'auth-callback', component: AuthCallback },


  { 
    path: '', 
    component: MainLayout,
    children: [
      { path: 'feed', component: Feed },
      { path: 'agenda', component: Agenda },
      { path: 'perfil', component: Perfil },
    ]
  }
];