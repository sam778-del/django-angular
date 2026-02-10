import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { ForbiddenComponent } from './forbidden/forbidden';
import { LoginComponent } from './auth/login/login';
import { authGuard } from './services/guards/auth.guard';
import { roleGuard } from './services/guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'unauthorized',
        component: ForbiddenComponent
    },
    {
        path: 'dashboard',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('./dashboard/dashboard.routes').then(
                        (m) => m.DASHBOARD_ROUTES
                    )
            }
        ]
    },
    {
        path: 'organizations',
        component: MainLayoutComponent,
        canActivate: [],
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('./organizations/organizations.routes').then(
                        (m) => m.ORGANIZATIONS_ROUTES
                    )
            }
        ]
    },
    {
        path: 'users',
        component: MainLayoutComponent,
        canActivate: [],
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('./users/users.routes').then((m) => m.USERS_ROUTES)
            }
        ]
    },
    {
        path: 'projects',
        component: MainLayoutComponent,
        canActivate: [],
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('./projects/projects.routes').then((m) => m.PROJECTS_ROUTES)
            }
        ]
    },
    {
        path: 'records',
        component: MainLayoutComponent,
        canActivate: [],
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('./records/records.routes').then((m) => m.RECORDS_ROUTES)
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];