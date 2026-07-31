import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/authresponse';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7298/api/Auth';
  private currentUserSubject = new BehaviorSubject<string | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { 
    try {
      const token = localStorage.getItem('token');
      if(token){
        this.currentUserSubject.next('user');
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }

  login(credentials: User): Observable<AuthResponse>{
    return this.http.post<AuthResponse>(this.apiUrl+"/Login", credentials)
                    .pipe(
                      tap((response) => {
                        try {
                          localStorage.setItem('token', response.token);
                          this.currentUserSubject.next('user');
                        } catch (error) {
                          console.error('Error saving token:', error);
                        }
                      })
                    )
  }

  register(credentials: User): Observable<AuthResponse>{
    return this.http.post<AuthResponse>(this.apiUrl+"/Register", credentials)
                    .pipe(
                      tap((response) => {
                        try {
                          localStorage.setItem('token', response.token);
                          this.currentUserSubject.next('user');
                        } catch (error) {
                          console.error('Error saving token:', error);
                        }
                      })
                    )
  }
  
  logout(): void {
    try {
      localStorage.removeItem("token");
    } catch (error) {
      console.error('Error removing token:', error);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    try {
      return !!localStorage.getItem('token');
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }
}
