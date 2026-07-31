import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Login } from './components/login/login';
import { TransactionForm } from './components/transaction-form/transaction-form';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { TransactionList } from './components/transaction-list/transaction-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Header,Footer],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Expenses.Client');
}
