import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer style="text-align: center; padding: 1rem; background: #f3f4f6;">
      <p>&copy; 2026 Expense Tracker. All rights reserved.</p>
    </footer>
  `
})
export class Footer {
}
