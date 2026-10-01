import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.css'
})
export class ReportsPageComponent {
  private readonly api = inject(ApiService);
  protected year = new Date().getFullYear();
  protected readonly report = signal('');

  load(): void {
    this.api.get(`/reports/annual/${this.year}`).subscribe((response) => this.report.set(JSON.stringify(response, null, 2)));
  }
}
