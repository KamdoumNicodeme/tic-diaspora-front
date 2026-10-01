import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardSummary } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  protected readonly summary = signal<DashboardSummary | null>(null);

  ngOnInit(): void {
    this.api.get<DashboardSummary>('/dashboard').subscribe((summary) => this.summary.set(summary));
  }

  protected money(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value) + ' XAF';
  }

  protected fullName(member: { firstName: string; lastName: string }): string {
    return `${member.firstName} ${member.lastName}`;
  }

  protected beneficiaryNames(data: DashboardSummary): string {
    return [data.currentBeneficiaryFullName, data.secondaryBeneficiaryFullName].filter(Boolean).join(' + ') || 'Aucun cycle';
  }
}
