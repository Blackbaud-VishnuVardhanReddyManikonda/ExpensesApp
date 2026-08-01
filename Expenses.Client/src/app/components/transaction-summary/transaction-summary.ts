import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction';
import { TransactionSummary } from '../../models/transaction-summary';

@Component({
  selector: 'app-transaction-summary',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './transaction-summary.html',
  styleUrl: './transaction-summary.css'
})
export class TransactionSummaryComponent implements OnInit {
  summary: TransactionSummary | null = null;
  isLoading = true;
  errorMessage = '';
  startDate = '';
  endDate = '';

  constructor(
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    // Validate dates - compare as Date objects, not strings
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      if (start > end) {
        this.errorMessage = 'Start date cannot be after end date';
        this.isLoading = false;
        this.summary = null;
        this.cdr.markForCheck();
        return;
      }
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.summary = null;
    this.cdr.markForCheck();

    console.log('loadSummary() called with dates:', {
      startDate: this.startDate,
      endDate: this.endDate
    });

    this.transactionService.getSummary(this.startDate || undefined, this.endDate || undefined).subscribe({
      next: (data) => {
        console.log('next() - Summary loaded:', data);
        this.summary = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('error() - Error loading summary:', error);
        this.errorMessage = error.error?.message || `Failed to load summary: ${error?.status || error.message}`;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      complete: () => {
        console.log('complete() - Observable completed');
      }
    });
  }

  clearFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.errorMessage = '';
    this.summary = null;
    this.cdr.markForCheck();
    this.loadSummary();
  }
}