import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contribution, Member, TontineCycle } from '../../core/models/api.models';
import { TontineService } from './tontine.service';
import { ContributionService } from '../contributions/contribution.service';
import { MemberService } from '../members/member.service';
import { AuthService } from '../../core/auth/auth.service';

type BeneficiaryRecipient = {
  name?: string;
  expectedAmount: number;
  orangeMoneyNumber?: string;
  orangeMoneyAccountName?: string;
  mtnMoneyNumber?: string;
  mtnMoneyAccountName?: string;
};

@Component({
  selector: 'app-tontine-detail',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './tontine-detail.component.html',
  styleUrl: './tontine-detail.component.css'
})
export class TontineDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly auth = inject(AuthService);
  private readonly tontine = inject(TontineService);
  private readonly contributionService = inject(ContributionService);
  private readonly membersService = inject(MemberService);
  private readonly fb = inject(FormBuilder);
  protected readonly cycle = signal<TontineCycle | null>(null);
  protected readonly contributions = signal<Contribution[]>([]);
  protected readonly members = signal<Member[]>([]);
  protected readonly beneficiaryForm = this.fb.nonNullable.group({
    beneficiaryId: ['', Validators.required],
    secondaryBeneficiaryId: [''],
    unanimousAgreement: [false, Validators.requiredTrue]
  });

  ngOnInit(): void {
    this.load();
  }

  open(id: string): void {
    this.tontine.open(id).subscribe(() => this.load());
  }

  close(id: string): void {
    this.tontine.close(id).subscribe(() => this.load());
  }

  changeBeneficiary(id: string): void {
    const raw = this.beneficiaryForm.getRawValue();
    const secondaryBeneficiaryId = this.isPrimaryBeneficiary50000() ? raw.secondaryBeneficiaryId : '';
    this.tontine.changeBeneficiary(id, raw.beneficiaryId, secondaryBeneficiaryId, raw.unanimousAgreement).subscribe((cycle) => {
      this.cycle.set(cycle);
      this.beneficiaryForm.patchValue({
        beneficiaryId: cycle.beneficiaryId ?? '',
        secondaryBeneficiaryId: cycle.secondaryBeneficiaryId ?? '',
        unanimousAgreement: false
      });
      this.load();
    });
  }

  openProof(proofUrl: string): void {
    this.contributionService.openProof(proofUrl);
  }

  private load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    this.tontine.get(id).subscribe((cycle) => {
      this.cycle.set(cycle);
      this.beneficiaryForm.patchValue({
        beneficiaryId: cycle.beneficiaryId ?? '',
        secondaryBeneficiaryId: cycle.secondaryBeneficiaryId ?? ''
      });
      this.syncSecondaryBeneficiaryControl();
    });
    this.tontine.contributions(id).subscribe((items) => this.contributions.set(items));
    if (this.auth.isPresident()) {
      this.membersService.list().subscribe((page) => {
        this.members.set(page.content);
        this.syncSecondaryBeneficiaryControl();
      });
    }
  }

  protected onPrimaryBeneficiaryChange(): void {
    this.syncSecondaryBeneficiaryControl();
  }

  protected isPrimaryBeneficiary50000(): boolean {
    const primaryId = this.beneficiaryForm.controls.beneficiaryId.value;
    if (!primaryId) {
      return false;
    }
    const member = this.members().find((item) => item.id === primaryId);
    if (member) {
      return member.contributionType === 'XAF_50000';
    }
    const cycle = this.cycle();
    return cycle?.beneficiaryId === primaryId && !!cycle.secondaryBeneficiaryId;
  }

  protected eligibleSecondaryBeneficiaries(): Member[] {
    const primaryId = this.beneficiaryForm.controls.beneficiaryId.value;
    return this.members().filter((member) => member.contributionType === 'XAF_50000' && member.id !== primaryId);
  }

  private syncSecondaryBeneficiaryControl(): void {
    const control = this.beneficiaryForm.controls.secondaryBeneficiaryId;
    if (this.isPrimaryBeneficiary50000()) {
      control.setValidators([Validators.required]);
    } else {
      control.setValue('');
      control.clearValidators();
    }
    control.updateValueAndValidity({ emitEvent: false });
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
}
