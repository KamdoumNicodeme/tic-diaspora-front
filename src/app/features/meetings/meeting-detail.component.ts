import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meeting, Member } from '../../core/models/api.models';
import { MeetingService } from './meeting.service';
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
  selector: 'app-meeting-detail',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './meeting-detail.component.html',
  styleUrl: './meeting-detail.component.css'
})
export class MeetingDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly auth = inject(AuthService);
  private readonly meetings = inject(MeetingService);
  private readonly membersService = inject(MemberService);
  private readonly fb = inject(FormBuilder);
  protected readonly meeting = signal<Meeting | null>(null);
  protected readonly members = signal<Member[]>([]);
  protected readonly minutesSavedMessage = signal('');
  protected readonly form = this.fb.nonNullable.group({
    notes: [''],
    decisionsSummary: [''],
    projectsSummary: ['']
  });
  protected readonly beneficiaryForm = this.fb.nonNullable.group({
    beneficiaryId: ['', Validators.required],
    secondaryBeneficiaryId: [''],
    unanimousAgreement: [false, Validators.requiredTrue]
  });

  ngOnInit(): void {
    this.load();
  }

  start(id: string): void {
    this.meetings.start(id).subscribe((meeting) => this.meeting.set(meeting));
  }

  complete(id: string): void {
    this.meetings.complete(id, this.form.getRawValue()).subscribe((meeting) => this.meeting.set(meeting));
  }

  saveMinutes(id: string): void {
    this.meetings.saveMinutes(id, this.form.getRawValue()).subscribe((meeting) => {
      this.meeting.set(meeting);
      this.minutesSavedMessage.set('Compte rendu sauvegardé.');
    });
  }

  saveBeneficiary(id: string): void {
    const raw = this.beneficiaryForm.getRawValue();
    const secondaryBeneficiaryId = this.isPrimaryBeneficiary50000() ? raw.secondaryBeneficiaryId : '';
    this.meetings.changeBeneficiary(id, raw.beneficiaryId, secondaryBeneficiaryId, raw.unanimousAgreement).subscribe((meeting) => {
      this.meeting.set(meeting);
      this.beneficiaryForm.patchValue({
        beneficiaryId: meeting.beneficiaryId ?? '',
        secondaryBeneficiaryId: meeting.secondaryBeneficiaryId ?? '',
        unanimousAgreement: false
      });
    });
  }

  private load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    this.meetings.get(id).subscribe((meeting) => {
      this.meeting.set(meeting);
      this.beneficiaryForm.patchValue({
        beneficiaryId: meeting.beneficiaryId ?? '',
        secondaryBeneficiaryId: meeting.secondaryBeneficiaryId ?? ''
      });
      this.syncSecondaryBeneficiaryControl();
      this.form.patchValue({
        notes: meeting.notes ?? '',
        decisionsSummary: meeting.decisionsSummary ?? '',
        projectsSummary: meeting.projectsSummary ?? ''
      });
    });
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
    const meeting = this.meeting();
    return meeting?.beneficiaryId === primaryId && !!meeting.secondaryBeneficiaryId;
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

  protected beneficiaryRecipients(meeting: Meeting): BeneficiaryRecipient[] {
    const recipients: BeneficiaryRecipient[] = [{
      name: meeting.beneficiaryFullName,
      expectedAmount: meeting.beneficiaryExpectedAmount,
      orangeMoneyNumber: meeting.beneficiaryOrangeMoneyNumber,
      orangeMoneyAccountName: meeting.beneficiaryOrangeMoneyAccountName,
      mtnMoneyNumber: meeting.beneficiaryMtnMoneyNumber,
      mtnMoneyAccountName: meeting.beneficiaryMtnMoneyAccountName
    }];
    if (meeting.secondaryBeneficiaryId || meeting.secondaryBeneficiaryFullName) {
      recipients.push({
        name: meeting.secondaryBeneficiaryFullName,
        expectedAmount: meeting.secondaryBeneficiaryExpectedAmount,
        orangeMoneyNumber: meeting.secondaryBeneficiaryOrangeMoneyNumber,
        orangeMoneyAccountName: meeting.secondaryBeneficiaryOrangeMoneyAccountName,
        mtnMoneyNumber: meeting.secondaryBeneficiaryMtnMoneyNumber,
        mtnMoneyAccountName: meeting.secondaryBeneficiaryMtnMoneyAccountName
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
