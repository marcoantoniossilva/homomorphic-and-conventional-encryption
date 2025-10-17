// Angular Core
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

// Application Services
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './main-panel.html'
})
export class MainPanelComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }
  
  isAdmin: boolean = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin() || false;
  }
  
  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
