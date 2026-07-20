// transaction-form.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../services/transaction';

@Component({
  selector: 'app-transaction-form',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.transactionForm = this.fb.group({
      type: ['Expense', Validators.required],
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      createdAt: [today, Validators.required]
    });
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
    if (this.transactionForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

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
            this.errorMessage = `Failed to update transaction: ${error?.status}`;
            this.isLoading = false;
          }
        });
      } else {
        this.transactionService.create(transaction as any).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/transactions']);
          },
          error: (error) => {
            this.errorMessage = `Failed to create transaction: ${error?.status}`;
            this.isLoading = false;
          }
        });
      }
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