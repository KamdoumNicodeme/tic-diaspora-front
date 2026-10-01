import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { AbsenceRequest, Meeting } from '../../core/models/api.models';
import { MeetingService } from '../meetings/meeting.service';
import { AbsenceRequestService } from './absence-request.service';

@Component({
  selector: 'app-absence-requests-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './absence-requests-page.component.html',
  styleUrl: './absence-requests-page.component.css'
})
export class AbsenceRequestsPageComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly absenceRequests = inject(AbsenceRequestService);
  private readonly meetingsService = inject(MeetingService);

  protected readonly requests = signal<AbsenceRequest[]>([]);
  protected readonly meetings = signal<Meeting[]>([]);
  protected readonly comments = signal<Record<string, string>>({});
  protected readonly exceptionalApprovals = signal<Record<string, boolean>>({});
  protected readonly requestForm = this.fb.nonNullable.group({
    meetingId: ['', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(3)]]
  });

  protected readonly availableMeetings = computed(() =>
    this.meetings().filter((meeting) => meeting.status === 'PLANNED' || meeting.status === 'IN_PROGRESS')
  );

  ngOnInit(): void {
    this.load();
  }

  submit(): void {
    const memberId = this.auth.token()?.memberId;
    if (!memberId) {
      return;
    }
    this.absenceRequests.create({ memberId, ...this.requestForm.getRawValue() }).subscribe(() => {
      this.requestForm.reset({ meetingId: '', reason: '' });
      this.load();
    });
  }

  approve(id: string): void {
    this.absenceRequests.approve(id, {
      validationComment: this.validationComment(id),
      exceptionalApproval: this.exceptionalApproval(id)
    }).subscribe(() => this.load());
  }

  reject(id: string): void {
    this.absenceRequests.reject(id, this.validationComment(id)).subscribe(() => this.load());
  }

  canValidate(request: AbsenceRequest): boolean {
    return request.status === 'PENDING' || request.status === 'LATE_REQUEST' || request.status === 'AUTO_APPROVED';
  }

  validationComment(id: string): string {
    return this.comments()[id] ?? '';
  }

  exceptionalApproval(id: string): boolean {
    return this.exceptionalApprovals()[id] ?? false;
  }

  setValidationComment(id: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.comments.update((comments) => ({ ...comments, [id]: value }));
  }

  setExceptionalApproval(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.exceptionalApprovals.update((approvals) => ({ ...approvals, [id]: checked }));
  }

  private load(): void {
    this.meetingsService.list().subscribe((page) => this.meetings.set(page.content));
    if (this.auth.isPresident()) {
      this.absenceRequests.list().subscribe((page) => this.requests.set(page.content));
      return;
    }
    this.absenceRequests.mine().subscribe((items) => this.requests.set(items));
  }
}
