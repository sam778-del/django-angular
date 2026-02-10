import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    standalone: true,
    imports: [CommonModule]
})
export class LoginComponent implements OnInit {
    errorMessage = '';
    constructor(
        public authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        if (this.authService.authenticated()) {
            this.router.navigate(['/dashboard']);
        }
    }

    login() {
        try {
            this.errorMessage = '';
            this.authService.login();
        } catch (error: any) {
            this.errorMessage = error?.message || 'Login failed. Please try again.';
            console.error('Login error:', error);
        }
    }
}