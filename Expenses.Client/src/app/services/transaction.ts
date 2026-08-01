import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction';
import { TransactionSummary } from '../models/transaction-summary';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl = 'https://expensesapp-api-ccdaf2cubragdveh.southindia-01.azurewebsites.net/';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(
      this.apiUrl + 'api/Transactions/All'
    );
  }

  getById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(
      this.apiUrl + 'api/Transactions/Details/' + id
    );
  }

  create(transaction: any): Observable<Transaction> {
    return this.http.post<Transaction>(
      this.apiUrl + 'api/Transactions/Create',
      transaction
    );
  }

  update(id: number, transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(
      this.apiUrl + 'api/Transactions/Update/' + id,
      transaction
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      this.apiUrl + 'api/Transactions/Delete/' + id
    );
  }

  getSummary(startDate?: string, endDate?: string): Observable<TransactionSummary> {
    return new Observable(observer => {
      console.log('getSummary called with:', { startDate, endDate });
      
      this.getAll().subscribe({
        next: (transactions) => {
          console.log('Received transactions:', transactions.length);
          
          try {
            // Parse dates
            let start = new Date('1970-01-01');
            let end = new Date('2099-12-31');

            if (startDate) {
              start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              console.log('Start date set to:', start);
            }

            if (endDate) {
              end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
              console.log('End date set to:', end);
            }

            // Filter
            const filtered = transactions.filter(t => {
              const tDate = new Date(t.createdAt);
              return tDate >= start && tDate <= end;
            });

            console.log('Filtered count:', filtered.length);

            // Calculate summary
            const summary: TransactionSummary = {
              totalIncome: 0,
              totalExpense: 0,
              balance: 0,
              transactionCount: filtered.length,
              byCategory: []
            };

            const categoryMap = new Map();

            filtered.forEach(t => {
              const isIncome = t.type?.toLowerCase() === 'income';
              const amount = t.amount || 0;

              if (isIncome) {
                summary.totalIncome += amount;
              } else {
                summary.totalExpense += amount;
              }

              const key = t.category + '-' + t.type;
              if (!categoryMap.has(key)) {
                categoryMap.set(key, {
                  category: t.category,
                  type: t.type,
                  total: 0,
                  count: 0
                });
              }

              const cat = categoryMap.get(key);
              cat.total += amount;
              cat.count += 1;
            });

            summary.balance = summary.totalIncome - summary.totalExpense;
            summary.byCategory = Array.from(categoryMap.values());

            console.log('Sending summary:', summary);
            observer.next(summary);
            observer.complete();
          } catch (error) {
            console.error('Error processing:', error);
            observer.error(error);
          }
        },
        error: (err) => {
          console.error('Error from getAll:', err);
          observer.error(err);
        }
      });
    });
  }
}