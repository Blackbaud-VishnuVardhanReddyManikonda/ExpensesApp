import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header-container">
      <div class="header-content">
        <h1>Expense Tracker</h1>
        <nav *ngIf="authService">
          <div *ngIf="(authService.currentUser$ | async)">
            <a [routerLink]="'/add'">Add</a>
            <a (click)="authService.logout()">Logout</a>
          </div>
          <div *ngIf="!(authService.currentUser$ | async)">
            <a [routerLink]="'/login'">Login</a>
          </div>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header-container {
      background: #6366f1;
      color: white;
      padding: 1rem;
    }
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    nav a {
      color: white;
      margin-left: 1rem;
      cursor: pointer;
      text-decoration: none;
    }
  `]
})
export class Header {
  constructor(public authService: AuthService) {}
}
