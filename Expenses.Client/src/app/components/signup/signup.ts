import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
  changeDetection: ChangeDetectionStrategy.OnPush  // ✅ CRITICAL FIX
})
export class Signup {
  signupForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;
  passwordMismatch: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef  // ✅ Inject ChangeDetectorRef
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.setupPasswordValidation();
  }

  setupPasswordValidation(): void {
    const passwordControl = this.signupForm.get('password');
    const confirmPasswordControl = this.signupForm.get('confirmPassword');

    passwordControl?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
      this.cdr.markForCheck();  // ✅ Force change detection
    });

    confirmPasswordControl?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
      this.cdr.markForCheck();  // ✅ Force change detection
    });
  }

  checkPasswordMatch(): void {
    const password = this.signupForm.get('password')?.value;
    const confirmPassword = this.signupForm.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      this.passwordMismatch = true;
    } else {
      this.passwordMismatch = false;
    }
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.signupForm.get(controlName);
    
    if (!control) {
      return false;
    }
    
    const isTouched = control.touched || control.dirty;
    const hasError = control.hasError(errorName);
    
    return !!(isTouched && hasError);
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.cdr.markForCheck();  // ✅ Force update

    if (this.passwordMismatch) {
      this.errorMessage = 'Passwords do not match. Please check and try again.';
      this.cdr.markForCheck();  // ✅ Force update
      return;
    }

    if (this.signupForm.valid) {
      this.isLoading = true;
      this.cdr.markForCheck();  // ✅ Force update

      const { email, password } = this.signupForm.value;
      const credentials = { email, password };

      this.authService.register(credentials).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Account created successfully! Redirecting...';
          this.cdr.markForCheck();  // ✅ Force update
          
          setTimeout(() => {
            this.router.navigate(['/transactions']);
          }, 1500);
        },
        error: (error) => {
          // ✅ CRITICAL: Set isLoading to false FIRST
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

          console.error('Registration error:', error);
          console.error('Backend message:', backendErrorMessage);

          // Handle different status codes
          if (error.status === 400) {
            if (backendErrorMessage.toLowerCase().includes('already taken') ||
                backendErrorMessage.toLowerCase().includes('already registered') ||
                backendErrorMessage.toLowerCase().includes('already exists')) {
              this.errorMessage = 'This email address is already registered. Please login instead.';
            } else {
              this.errorMessage = backendErrorMessage || 'Invalid request. Please check your input.';
            }
          } else if (error.status === 409) {
            this.errorMessage = 'This email address is already registered. Please login instead.';
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to the server. Please check if the backend is running on localhost:7298';
          } else if (error.status >= 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = backendErrorMessage || 'An error occurred. Please try again.';
          }

          console.error('Final errorMessage:', this.errorMessage);
          // ✅ CRITICAL: Force Angular to update the view
          this.cdr.markForCheck();
        }
      });
    }
  }
}