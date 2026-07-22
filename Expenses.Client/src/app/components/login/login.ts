import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.loginForm.get(controlName);
    
    if (!control) {
      return false;
    }
    
    const isTouched = control.touched || control.dirty;
    const hasError = control.hasError(errorName);
    
    return !!(isTouched && hasError);
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.cdr.markForCheck();

    if (this.loginForm.valid) {
      this.isLoading = true;
      this.cdr.markForCheck();

      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.router.navigate(['/transactions']);
        },
        error: (error) => {
          this.isLoading = false;

          let backendErrorMessage = '';

          // Check different ways the error might be returned
          if (error.error && typeof error.error === 'string') {
            backendErrorMessage = error.error;
          } else if (error.error?.message && typeof error.error.message === 'string') {
            backendErrorMessage = error.error.message;
          } else if (typeof error.error === 'object' && error.error !== null) {
            // If it's an object, try to get the message property
            backendErrorMessage = JSON.stringify(error.error);
          } else if (error.statusText) {
            backendErrorMessage = error.statusText;
          }

          console.error('Login error:', error);
          console.error('Backend message:', backendErrorMessage);

          if (error.status === 401) {
            this.errorMessage = 'Invalid email or password. Please try again.';
          } else if (error.status === 400) {
            this.errorMessage = backendErrorMessage || 'Invalid request. Please check your input.';
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to the server. Please check if the backend is running on localhost:7298';
          } else {
            this.errorMessage = backendErrorMessage || 'An error occurred during login. Please try again.';
          }

          console.error('Final errorMessage:', this.errorMessage);
          this.cdr.markForCheck();
        }
      });
    }
  }
}