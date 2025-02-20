import { Routes } from '@angular/router';
import { isLoggedGuard } from './guards/is-logged/is-logged.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
      },
      {
        path: 'user',
        canActivate: [isLoggedGuard],
        loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule),
      },
];
