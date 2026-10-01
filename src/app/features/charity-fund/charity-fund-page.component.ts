import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CharityMovement, CharityMovementType, CharitySummary, Project } from '../../core/models/api.models';
import { ProjectService } from '../projects/project.service';
import { CharityFundService } from './charity-fund.service';

@Component({
  selector: 'app-charity-fund-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './charity-fund-page.component.html',
  styleUrl: './charity-fund-page.component.css'
})
export class CharityFundPageComponent implements OnInit {
  private readonly charity = inject(CharityFundService);
  private readonly projectsService = inject(ProjectService);
  private readonly fb = inject(FormBuilder);

  protected readonly summary = signal<CharitySummary>({
    balance: 0,
    totalIncome: 0,
    totalOutcome: 0,
    currentYearIncome: 0,
    currentYearOutcome: 0,
    movementsCount: 0
  });
  protected readonly movements = signal<CharityMovement[]>([]);
  protected readonly projects = signal<Project[]>([]);
  protected readonly message = signal('');
  protected readonly error = signal('');

  protected readonly incomeMovements = computed(() => this.movements().filter((movement) => movement.amount > 0));
  protected readonly outcomeMovements = computed(() => this.movements().filter((movement) => movement.amount < 0));

  protected readonly form = this.fb.nonNullable.group({
    projectId: [''],
    amount: [0, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit(): void {
    this.load();
    this.projectsService.list().subscribe((page) => this.projects.set(page.content));
  }

  outcome(): void {
    if (this.form.invalid) {
      return;
    }
    this.message.set('');
    this.error.set('');
    const value = this.form.getRawValue();
    this.charity.outcome({
      projectId: value.projectId || null,
      amount: value.amount,
      description: value.description.trim()
    }).subscribe({
      next: () => {
        this.message.set('Sortie caritative enregistrée et auditée.');
        this.form.reset({ projectId: '', amount: 0, description: '' });
        this.load();
      },
      error: () => this.error.set("Impossible d'enregistrer la sortie. Vérifiez le solde et la justification.")
    });
  }

  protected movementLabel(type: CharityMovementType): string {
    return {
      PENALTY_INCOME: 'Pénalité payée',
      MANUAL_INCOME: 'Entrée manuelle',
      CHARITY_OUTCOME: 'Sortie caritative',
      ADJUSTMENT: 'Ajustement'
    }[type];
  }

  protected movementClass(movement: CharityMovement): string {
    return movement.amount >= 0
      ? 'bg-mint/10 text-mint dark:bg-emerald-300/10 dark:text-emerald-100'
      : 'bg-coral/10 text-coral dark:bg-red-300/10 dark:text-red-100';
  }

  protected signedMoney(value: number): string {
    const prefix = value > 0 ? '+' : value < 0 ? '-' : '';
    return prefix + this.money(Math.abs(value));
  }

  protected money(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value) + ' XAF';
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }

  private load(): void {
    this.charity.summary().subscribe((summary) => this.summary.set(summary));
    this.charity.movements().subscribe((page) => this.movements.set(page.content));
  }
}
