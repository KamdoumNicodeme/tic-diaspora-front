import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { TontineCycle } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { TontineService } from '../tontine/tontine.service';

@Component({
  selector: 'app-beneficiaries-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './beneficiaries-page.component.html',
  styleUrl: './beneficiaries-page.component.css'
})
export class BeneficiariesPageComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly tontine = inject(TontineService);
  protected readonly result = signal('');
  protected readonly cycles = signal<TontineCycle[]>([]);
  protected readonly selectedCycle = signal<TontineCycle | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    comment: ['']
  });

  ngOnInit(): void {
    this.tontine.list().subscribe((page) => {
      this.cycles.set(page.content);
      this.selectDefaultCycle();
    });
  }

  confirm(): void {
    const cycle = this.selectedCycle();
    if (!cycle) {
      this.result.set('Aucun cycle bénéficiaire disponible.');
      return;
    }
    this.api.patch(`/beneficiaries/${cycle.id}/confirm`, { comment: this.form.getRawValue().comment })
      .subscribe((response) => this.result.set(JSON.stringify(response, null, 2)));
  }

  protected chooseCycle(cycleId: string): void {
    this.selectedCycle.set(this.cycles().find((cycle) => cycle.id === cycleId) ?? null);
  }

  protected money(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value) + ' XAF';
  }

  protected beneficiaryNames(cycle: TontineCycle): string {
    return [cycle.beneficiaryFullName, cycle.secondaryBeneficiaryFullName].filter(Boolean).join(' + ') || 'bénéficiaire à définir';
  }

  private selectDefaultCycle(): void {
    const memberId = this.auth.token()?.memberId;
    const visibleCycles = this.auth.isPresident()
      ? this.cycles()
      : this.cycles().filter((cycle) => cycle.beneficiaryId === memberId || cycle.secondaryBeneficiaryId === memberId);
    this.selectedCycle.set(this.bestCycleForMeetingMonth(visibleCycles));
  }

  private bestCycleForMeetingMonth(cycles: TontineCycle[]): TontineCycle | null {
    const today = new Date();
    const firstSunday = this.firstSunday(today.getFullYear(), today.getMonth());
    const target = today > firstSunday ? new Date(today.getFullYear(), today.getMonth() + 1, 1) : today;
    const targetMonth = target.getMonth() + 1;
    const targetYear = target.getFullYear();
    return cycles.find((cycle) => cycle.month === targetMonth && cycle.year === targetYear)
      ?? cycles
        .filter((cycle) => cycle.year > targetYear || (cycle.year === targetYear && cycle.month >= targetMonth))
        .sort((a, b) => a.year - b.year || a.month - b.month)[0]
      ?? cycles.sort((a, b) => b.year - a.year || b.month - a.month)[0]
      ?? null;
  }

  private firstSunday(year: number, zeroBasedMonth: number): Date {
    const date = new Date(year, zeroBasedMonth, 1);
    const daysUntilSunday = (7 - date.getDay()) % 7;
    return new Date(year, zeroBasedMonth, 1 + daysUntilSunday, 23, 59, 59, 999);
  }
}
