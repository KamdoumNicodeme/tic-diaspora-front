import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Contribution, Member, PaymentMethod, TontineCycle } from '../../core/models/api.models';
import { ContributionService } from './contribution.service';
import { TontineService } from '../tontine/tontine.service';
import { MemberService } from '../members/member.service';

type BeneficiaryRecipient = {
  name?: string;
  expectedAmount: number;
  orangeMoneyNumber?: string;
  orangeMoneyAccountName?: string;
  mtnMoneyNumber?: string;
  mtnMoneyAccountName?: string;
};

@Component({
  selector: 'app-contributions-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contributions-page.component.html',
  styleUrl: './contributions-page.component.css'
})
export class ContributionsPageComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly service = inject(ContributionService);
  private readonly tontine = inject(TontineService);
  private readonly membersService = inject(MemberService);
  private readonly fb = inject(FormBuilder);
  protected readonly contributions = signal<Contribution[]>([]);
  protected readonly cycles = signal<TontineCycle[]>([]);
  protected readonly members = signal<Member[]>([]);
  protected readonly currentMember = signal<Member | null>(null);
  protected readonly selectedCycle = signal<TontineCycle | null>(null);
  protected readonly selectedProof = signal<File | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    cycleId: ['', Validators.required],
    memberId: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    method: ['MOBILE_MONEY' as PaymentMethod, Validators.required],
    transactionReference: ['']
  });

  ngOnInit(): void {
    const token = this.auth.token();
    if (!this.auth.isPresident() && token?.memberId) {
      this.form.controls.memberId.setValue(token.memberId);
      this.form.controls.memberId.disable();
    }
    this.loadCycles();
    this.loadMembers();
    this.load();
  }

  selectCycle(): void {
    const cycleId = this.form.getRawValue().cycleId;
    this.selectedCycle.set(this.cycles().find((cycle) => cycle.id === cycleId) ?? null);
  }

  selectProof(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedProof.set(input.files?.item(0) ?? null);
  }

  pay(): void {
    this.ensureMemberCycleSelected();
    this.service.recordPaymentWithProof(this.form.getRawValue(), this.selectedProof()).subscribe(() => {
      const memberId = this.form.getRawValue().memberId;
      const cycleId = this.auth.isPresident() ? '' : this.form.getRawValue().cycleId;
      this.form.reset({ cycleId, memberId, amount: 0, method: 'MOBILE_MONEY', transactionReference: '' });
      if (!this.auth.isPresident()) {
        this.form.controls.memberId.disable();
      }
      this.selectedProof.set(null);
      this.selectCycle();
      this.load();
    });
  }

  validate(id: string): void {
    this.service.validate(id).subscribe(() => this.load());
  }

  openProof(proofUrl: string): void {
    this.service.openProof(proofUrl);
  }

  protected currentMemberName(): string {
    const member = this.currentMember();
    return member ? `${member.firstName} ${member.lastName}` : 'Votre compte';
  }

  protected cycleLabel(cycleId: string): string {
    const cycle = this.cycles().find((item) => item.id === cycleId);
    return cycle ? `${cycle.month}/${cycle.year}` : cycleId;
  }

  protected targetCycleLabel(): string {
    const target = this.targetCycleDate();
    return `${target.month}/${target.year}`;
  }

  protected cycleBeneficiaryLabel(cycle: TontineCycle): string {
    return this.beneficiaryRecipients(cycle).map((recipient) => recipient.name).filter(Boolean).join(' + ') || 'bénéficiaire à définir';
  }

  protected beneficiaryRecipients(cycle: TontineCycle): BeneficiaryRecipient[] {
    const recipients: BeneficiaryRecipient[] = [{
      name: cycle.beneficiaryFullName,
      expectedAmount: cycle.beneficiaryExpectedAmount,
      orangeMoneyNumber: cycle.beneficiaryOrangeMoneyNumber,
      orangeMoneyAccountName: cycle.beneficiaryOrangeMoneyAccountName,
      mtnMoneyNumber: cycle.beneficiaryMtnMoneyNumber,
      mtnMoneyAccountName: cycle.beneficiaryMtnMoneyAccountName
    }];
    if (cycle.secondaryBeneficiaryId || cycle.secondaryBeneficiaryFullName) {
      recipients.push({
        name: cycle.secondaryBeneficiaryFullName,
        expectedAmount: cycle.secondaryBeneficiaryExpectedAmount,
        orangeMoneyNumber: cycle.secondaryBeneficiaryOrangeMoneyNumber,
        orangeMoneyAccountName: cycle.secondaryBeneficiaryOrangeMoneyAccountName,
        mtnMoneyNumber: cycle.secondaryBeneficiaryMtnMoneyNumber,
        mtnMoneyAccountName: cycle.secondaryBeneficiaryMtnMoneyAccountName
      });
    }
    return recipients;
  }

  protected paymentProvider(recipient: BeneficiaryRecipient): string {
    return recipient.orangeMoneyNumber || recipient.orangeMoneyAccountName ? 'Orange Money' : 'MTN Money';
  }

  protected paymentNumber(recipient: BeneficiaryRecipient): string {
    return recipient.orangeMoneyNumber || recipient.mtnMoneyNumber || '-';
  }

  protected paymentAccountName(recipient: BeneficiaryRecipient): string {
    return recipient.orangeMoneyAccountName || recipient.mtnMoneyAccountName || '-';
  }

  protected money(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value) + ' XAF';
  }

  private load(): void {
    if (!this.auth.isPresident()) {
      const memberId = this.auth.token()?.memberId;
      if (!memberId) {
        this.contributions.set([]);
        return;
      }
      this.service.memberContributions(memberId).subscribe((items) => this.contributions.set(items));
      return;
    }
    this.service.list().subscribe((page) => this.contributions.set(page.content));
  }

  private loadCycles(): void {
    this.tontine.list().subscribe((page) => {
      this.cycles.set(page.content);
      if (!this.auth.isPresident()) {
        this.selectDefaultMemberCycle();
        return;
      }
      this.selectCycle();
    });
  }

  private loadMembers(): void {
    const memberId = this.auth.token()?.memberId;
    if (this.auth.isPresident()) {
      this.membersService.list().subscribe((page) => this.members.set(page.content));
      return;
    }
    if (memberId) {
      this.membersService.get(memberId).subscribe((member) => this.currentMember.set(member));
    }
  }

  private selectDefaultMemberCycle(): void {
    const target = this.targetCycleDate();
    const exactCycle = this.cycles().find((cycle) => cycle.month === target.month && cycle.year === target.year);
    const fallbackCycle = this.cycles()
      .filter((cycle) => cycle.year > target.year || (cycle.year === target.year && cycle.month >= target.month))
      .sort((a, b) => a.year - b.year || a.month - b.month)[0];
    const cycle = exactCycle ?? fallbackCycle ?? null;
    this.selectedCycle.set(cycle);
    this.form.controls.cycleId.setValue(cycle?.id ?? '');
  }

  private ensureMemberCycleSelected(): void {
    if (!this.auth.isPresident() && !this.form.getRawValue().cycleId) {
      this.selectDefaultMemberCycle();
    }
  }

  private targetCycleDate(): { month: number; year: number } {
    const today = new Date();
    const firstSunday = this.firstSunday(today.getFullYear(), today.getMonth());
    const target = today > firstSunday ? new Date(today.getFullYear(), today.getMonth() + 1, 1) : today;
    return { month: target.getMonth() + 1, year: target.getFullYear() };
  }

  private firstSunday(year: number, zeroBasedMonth: number): Date {
    const date = new Date(year, zeroBasedMonth, 1);
    const daysUntilSunday = (7 - date.getDay()) % 7;
    return new Date(year, zeroBasedMonth, 1 + daysUntilSunday, 23, 59, 59, 999);
  }
}
