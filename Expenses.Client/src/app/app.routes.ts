import { Login } from './components/login/login';
import { Routes } from '@angular/router';
import { Signup } from './components/signup/signup';
import { TransactionForm } from './components/transaction-form/transaction-form';
import { TransactionList } from './components/transaction-list/transaction-list';
import { TransactionSummaryComponent } from './components/transaction-summary/transaction-summary';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path:'signup',
    component:Signup
  },

  {
    path:'transactions',
    component:TransactionList,
    canActivate: [authGuard]
  },

  {
    path:'add',
    component:TransactionForm,
    canActivate: [authGuard]
  },

  {
    path:'summary',
    component:TransactionSummaryComponent,
    canActivate: [authGuard]
  },

  {
    path:'edit/:id',
    component:TransactionForm,
    canActivate: [authGuard]

  },
  //   {
  //   path:'',
  //   redirectTo:'/transactions',
  //   pathMatch:'full',
  //   canActivate: [authGuard]
  // },

  {
    path:'**',
    redirectTo:'/transactions'
  }
    
];