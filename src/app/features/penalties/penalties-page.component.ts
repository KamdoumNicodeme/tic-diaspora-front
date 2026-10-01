import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Meeting, Member, Penalty, PenaltyStatus, PenaltySummary, PenaltyType } from '../../core/models/api.models';
import { MeetingService } from '../meetings/meeting.service';
import { MemberService } from '../members/member.service';
import { PenaltyService } from './penalty.service';

@Component({
  selector: 'app-penalties-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './penalties-page.component.html',
  styleUrl: './penalties-page.component.css'
})
export class PenaltiesPageComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly penaltiesService = inject(PenaltyService);
  private readonly membersService = inject(MemberService);
  private readonly meetingsService = inject(MeetingService);
  private readonly fb = inject(FormBuilder);

  protected readonly penalties = signal<Penalty[]>([]);
  protected readonly members = signal<Member[]>([]);
  protected readonly meetings = signal<Meeting[]>([]);
  protected readonly statusFilter = signal<PenaltyStatus | ''>('');
  protected readonly selectedWaive = signal<Penalty | null>(null);
  protected readonly message = signal('');
  protected readonly error = signal('');
  protected readonly summary = signal<PenaltySummary>({
    totalCount: 0,
    pendingCount: 0,
    paidCount: 0,
    waivedCount: 0,
    cancelledCount: 0,
    pendingAmount: 0,
    paidAmount: 0,
    waivedAmount: 0,
    cancelledAmount: 0
  });

  protected readonly statuses: PenaltyStatus[] = ['PENDING', 'PAID', 'WAIVED', 'CANCELLED'];
  protected readonly types: PenaltyType[] = ['LATE_10', 'LATE_20', 'ABSENCE', 'ABSENT_FROM_DELAY'];

  protected readonly form = this.fb.nonNullable.group({
    memberId: ['', Validators.required],
    meetingId: [''],
    type: ['LATE_10' as PenaltyType, Validators.required],
    amount: [1000, [Validators.required, Validators.min(0)]],
    reason: ['', [Validators.required, Validators.minLength(4)]]
  });
  protected readonly waiveForm = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.minLength(8)]]
  });

  protected readonly pendingPenalties = computed(() => this.penalties().filter((penalty) => penalty.status === 'PENDING'));
  protected readonly paidPenalties = computed(() => this.penalties().filter((penalty) => penalty.status === 'PAID'));

  ngOnInit(): void {
    if (this.auth.isPresident()) {
      this.membersService.list().subscribe((page) => this.members.set(page.content));
      this.meetingsService.list().subscribe((page) => this.meetings.set(page.content));
      this.load();
      return;
    }
    const memberId = this.auth.token()?.memberId;
    if (memberId) {
      this.penaltiesService.mine(memberId).subscribe((items) => this.penalties.set(items));
    }
  }

  load(): void {
    if (!this.auth.isPresident()) {
      return;
    }
    this.penaltiesService.list(this.statusFilter()).subscribe((page) => this.penalties.set(page.content));
    this.penaltiesService.summary().subscribe((summary) => this.summary.set(summary));
  }

  filter(status: PenaltyStatus | ''): void {
    this.statusFilter.set(status);
    this.load();
  }

  selectType(): void {
    this.form.controls.amount.setValue(this.defaultAmount(this.form.getRawValue().type));
  }

  create(): void {
    if (this.form.invalid || !this.auth.isPresident()) {
      return;
    }
    this.message.set('');
    this.error.set('');
    const value = this.form.getRawValue();
    this.penaltiesService.create({
      memberId: value.memberId,
      meetingId: value.meetingId || null,
      type: value.type,
      amount: value.amount,
      reason: value.reason.trim()
    }).subscribe({
      next: () => {
        const type = this.form.getRawValue().type;
        this.form.reset({ memberId: '', meetingId: '', type, amount: this.defaultAmount(type), reason: '' });
        this.message.set('Pénalité créée.');
        this.load();
      },
      error: () => this.error.set("Impossible de créer la pénalité.")
    });
  }

  pay(penalty: Penalty): void {
    this.penaltiesService.pay(penalty.id).subscribe(() => {
      this.message.set('Pénalité payée et versée à la caisse caritative.');
      this.load();
    });
  }

  openWaive(penalty: Penalty): void {
    this.selectedWaive.set(penalty);
    this.waiveForm.reset({ reason: '' });
  }

  waive(): void {
    const penalty = this.selectedWaive();
    if (!penalty || this.waiveForm.invalid) {
      return;
    }
    this.penaltiesService.waive(penalty.id, this.waiveForm.getRawValue().reason.trim()).subscribe(() => {
      this.selectedWaive.set(null);
      this.message.set('Pénalité annulée avec justification.');
      this.load();
    });
  }

  protected defaultAmount(type: PenaltyType): number {
    return {
      LATE_10: 1000,
      LATE_20: 2000,
      ABSENCE: 5000,
      ABSENT_FROM_DELAY: 5000
    }[type];
  }

  protected typeLabel(type: PenaltyType): string {
    return {
      LATE_10: 'Retard 10-19 min',
      LATE_20: 'Retard 20-29 min',
      ABSENCE: 'Absence non autorisée',
      ABSENT_FROM_DELAY: 'Absent pour retard'
    }[type];
  }

  protected statusLabel(status: PenaltyStatus): string {
    return {
      PENDING: 'À payer',
      PAID: 'Payée',
      WAIVED: 'Annulée',
      CANCELLED: 'Supprimée'
    }[status];
  }

  protected statusClass(status: PenaltyStatus): string {
    return {
      PENDING: 'bg-saffron/15 text-stone-800 dark:bg-amber-300/10 dark:text-amber-100',
      PAID: 'bg-mint/10 text-mint dark:bg-emerald-300/10 dark:text-emerald-100',
      WAIVED: 'bg-plum/10 text-plum dark:bg-violet-300/10 dark:text-violet-100',
      CANCELLED: 'bg-coral/10 text-coral dark:bg-red-300/10 dark:text-red-100'
    }[status];
  }

  protected money(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value) + ' XAF';
  }

  protected formatDate(value?: string): string {
    return value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-';
  }
}
