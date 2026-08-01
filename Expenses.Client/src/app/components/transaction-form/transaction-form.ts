import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../services/transaction';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.css'
})
export class TransactionForm implements OnInit {
  transactionForm: FormGroup;
  incomeCategories = ['Salary', 'Freelance', 'Investment'];
  expenseCategories = ['Food', 'Transportation', 'Entertainment'];
  availableCategories: string[] = [];
  editMode = false;
  transactionId?: number;
  isLoading = false;
  errorMessage = '';
  todayDate = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.todayDate = today;
    
    this.transactionForm = this.fb.group({
      type: ['Expense', Validators.required],
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      createdAt: [today, [Validators.required, this.dateRangeValidator.bind(this)]]
    });
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      return { futureDate: { value: control.value } };
    }


    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    if (selectedDate < oneYearAgo) {
      return { tooOldDate: { value: control.value } };
    }

    return null;
  }

  ngOnInit(): void {
    this.updateAvailableCategories(this.transactionForm.get('type')?.value);
    
    this.transactionForm.get('type')?.valueChanges.subscribe(() => {
      this.onTypeChange();
    });

    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.transactionId = +id;
      this.loadTransaction(this.transactionId);
    }
  }

  onTypeChange(): void {
    const type = this.transactionForm.get('type')?.value;
    this.updateAvailableCategories(type);
    this.transactionForm.patchValue({ category: '' });
  }

  updateAvailableCategories(type: string): void {
    this.availableCategories = type === 'Expense' 
      ? this.expenseCategories 
      : this.incomeCategories;
  }

  onSubmit(): void {
    // Clear previous errors
    this.errorMessage = '';

    // Check if form is valid
    if (this.transactionForm.invalid) {
      // Get date control errors
      const dateControl = this.transactionForm.get('createdAt');
      
      if (dateControl?.hasError('futureDate')) {
        this.errorMessage = 'Cannot add transaction for future dates';
      } else if (dateControl?.hasError('tooOldDate')) {
        this.errorMessage = 'Cannot add transaction older than 1 year';
      } else {
        this.errorMessage = 'Please fill all required fields correctly';
      }
      return; // Don't submit
    }

    this.isLoading = true;

    const formValue = this.transactionForm.value;
    const transaction = {
      type: formValue.type,
      category: formValue.category,
      amount: parseFloat(formValue.amount),
      createdAt: formValue.createdAt
    };

    if (this.editMode && this.transactionId) {
      this.transactionService.update(this.transactionId, transaction as any).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/transactions']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || `Failed to update transaction: ${error?.status}`;
        }
      });
    } else {
      this.transactionService.create(transaction as any).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/transactions']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || `Failed to create transaction: ${error?.status}`;
        }
      });
    }
  }

  loadTransaction(id: number): void {
    this.transactionService.getById(id).subscribe({
      next: (transaction) => {
        this.updateAvailableCategories(transaction.type);
        const dateStr = new Date(transaction.createdAt).toISOString().split('T')[0];
        this.transactionForm.patchValue({
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          createdAt: dateStr
        });
      },
      error: (error) => {
        this.errorMessage = `Failed to load transaction: ${error?.status}`;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/transactions']);
  }
}