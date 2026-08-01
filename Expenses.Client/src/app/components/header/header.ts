import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],  
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(public authService: AuthService) {}
}