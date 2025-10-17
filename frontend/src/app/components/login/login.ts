// Angular Core
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Application Services
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  credentials = { username: '', password: '' };
  errorMessage: string | null = null;
  isLoading = false;
  hidePassword = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.validateToken().then((isValid) => {
      if (isValid) {
        this.router.navigate(['/admin']);
      }
    })
  }

  login(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Verificar se o usuário é administrador
        if (response.user) {
          console.log('Login bem-sucedido!');
          this.router.navigate(['/admin']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro no login:', error);
        this.errorMessage = error.error?.message || 'Falha no login. Verifique suas credenciais.';
      }
    });
  }
}
