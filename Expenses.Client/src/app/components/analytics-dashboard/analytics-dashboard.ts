import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction';
import { TransactionSummary } from '../../models/transaction-summary';

declare var Chart: any;

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-dashboard.html',
  styleUrl: './analytics-dashboard.css'
})
export class AnalyticsDashboardComponent implements OnInit, AfterViewInit {
  summary: TransactionSummary | null = null;
  isLoading = true;
  errorMessage = '';
  startDate = '';
  endDate = '';
  
  chartInstances: any = {
    categoryChart: null,
    trendChart: null,
    monthlyChart: null
  };

  constructor(
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    if (this.summary && !this.isLoading) {
      this.loadCharts();
    }
  }

  loadDashboard(): void {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      if (start > end) {
        this.errorMessage = 'Start date cannot be after end date';
        this.isLoading = false;
        this.cdr.markForCheck();
        return;
      }
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    console.log('Loading dashboard with dates:', {
      startDate: this.startDate,
      endDate: this.endDate
    });

    this.transactionService.getSummary(this.startDate || undefined, this.endDate || undefined).subscribe({
      next: (data) => {
        console.log('Dashboard data loaded:', data);
        this.summary = data;
        this.isLoading = false;
        this.cdr.markForCheck();
        setTimeout(() => this.loadCharts(), 100);
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.errorMessage = error.error?.message || `Failed to load dashboard: ${error?.status || error.message}`;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadCharts(): void {
    if (!this.summary || this.isLoading) return;

    setTimeout(() => {
      this.initializeCategoryChart();
      this.initializeTrendChart();
      this.initializeMonthlyChart();
    }, 50);
  }

  initializeCategoryChart(): void {
    const ctx = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!ctx || !this.summary) return;

    const categories = this.summary.byCategory || [];
    const labels = categories.map(c => c.category || 'Uncategorized');
    const data = categories.map(c => c.total || 0);

    const colors = ['#3B8BD4', '#EF8B2C', '#639922', '#E85D24', '#7F77DD', '#1D9E75', '#BA7517'];

    if (this.chartInstances.categoryChart) {
      this.chartInstances.categoryChart.destroy();
    }

    try {
      this.chartInstances.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors.slice(0, labels.length),
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const,
              labels: {
                font: { size: 12, family: '"Anthropic Sans", sans-serif' },
                color: '#374151',
                padding: 12
              }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const value = context.parsed || 0;
                  return '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating category chart:', error);
    }
  }

  initializeTrendChart(): void {
    const ctx = document.getElementById('trendChart') as HTMLCanvasElement;
    if (!ctx || !this.summary) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = Array(12).fill(0);

    if (this.chartInstances.trendChart) {
      this.chartInstances.trendChart.destroy();
    }

    try {
      this.chartInstances.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Income',
              data: [this.summary.totalIncome || 0, ...Array(11).fill(0)],
              borderColor: '#639922',
              backgroundColor: 'rgba(99, 153, 34, 0.05)',
              tension: 0.4,
              fill: true,
              pointRadius: 5,
              pointBackgroundColor: '#639922',
              pointBorderColor: '#fff',
              pointBorderWidth: 2
            },
            {
              label: 'Expenses',
              data: [this.summary.totalExpense || 0, ...Array(11).fill(0)],
              borderColor: '#E85D24',
              backgroundColor: 'rgba(232, 93, 36, 0.05)',
              tension: 0.4,
              fill: true,
              pointRadius: 5,
              pointBackgroundColor: '#E85D24',
              pointBorderColor: '#fff',
              pointBorderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
              labels: {
                font: { size: 12, family: '"Anthropic Sans", sans-serif' },
                color: '#374151',
                padding: 12,
                usePointStyle: true
              }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  return context.dataset.label + ': ₹' + (context.parsed.y || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
                }
              }
            }
          },
          scales: {
            y: {
              grid: { color: '#e5e7eb' },
              ticks: { color: '#6b7280', font: { size: 11 } }
            },
            x: {
              grid: { drawBorder: false, color: 'transparent' },
              ticks: { color: '#6b7280', font: { size: 11 } }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating trend chart:', error);
    }
  }

  initializeMonthlyChart(): void {
    const ctx = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!ctx || !this.summary) return;

    const categories = this.summary.byCategory || [];
    const labels = categories.slice(0, 6).map(c => c.category || 'Other');
    const data = categories.slice(0, 6).map(c => c.total || 0);

    const colors = ['#3B8BD4', '#EF8B2C', '#639922', '#E85D24', '#7F77DD', '#1D9E75'];

    if (this.chartInstances.monthlyChart) {
      this.chartInstances.monthlyChart.destroy();
    }

    try {
      this.chartInstances.monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Amount',
            data: data,
            backgroundColor: colors.slice(0, labels.length),
            borderRadius: 4,
            borderSkipped: false
          }]
        },
        options: {
          indexAxis: 'y' as const,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  return '₹' + (context.parsed.x || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: '#e5e7eb' },
              ticks: { color: '#6b7280', font: { size: 11 } }
            },
            y: {
              grid: { drawBorder: false, color: 'transparent' },
              ticks: { color: '#6b7280', font: { size: 11 } }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating monthly chart:', error);
    }
  }

  clearFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.errorMessage = '';
    this.loadDashboard();
  }

  getSpendingTrend(): string {
    if (!this.summary || !this.summary.byCategory) return 'Stable';
    const expenses = this.summary.byCategory.filter(c => c.type?.toLowerCase() === 'expense');
    return expenses.length > 0 ? 'Active' : 'Low';
  }

  getSavingsRate(): number {
    if (!this.summary || this.summary.totalIncome === 0) return 0;
    return Math.round(((this.summary.totalIncome - this.summary.totalExpense) / this.summary.totalIncome) * 100);
  }
}