import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Transaction } from '../../models/transaction';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transaction-list',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css'
})
export class TransactionList implements OnInit {
  transactions: Transaction[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private transactionService: TransactionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.transactions = Array.isArray(data) ? data : [];
        this.cdr.markForCheck();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = `Failed to load transactions: ${error?.status}`;
        this.isLoading = false;
      }
    });
  }

  getTotalIncome(): number {
    return this.transactions
      .filter(t => t.type?.toLowerCase() === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpenses(): number {
    return this.transactions
      .filter(t => ['expense', 'expenditure'].includes(t.type?.toLowerCase() || ''))
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getNetBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  editTransaction(transaction: Transaction): void {
    if (transaction.id) {
      this.router.navigate(['/edit', transaction.id]);
    }
  }

  deleteTransaction(transaction: Transaction): void {
    if (transaction.id && confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.delete(transaction.id).subscribe({
        next: () => {
          this.loadTransactions();
        },
        error: (error) => {
          this.errorMessage = `Failed to delete transaction: ${error?.status}`;
        }
      });
    }
  }
}