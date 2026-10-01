import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './attendance-page.component.html',
  styleUrl: './attendance-page.component.css'
})
export class AttendancePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  protected readonly result = signal('');
  protected readonly form = this.fb.nonNullable.group({
    meetingId: ['', Validators.required],
    memberId: ['', Validators.required],
    arrivalAt: [new Date().toISOString().slice(0, 16), Validators.required]
  });

  checkIn(): void {
    const raw = this.form.getRawValue();
    this.api.post('/attendance/check-in', { ...raw, arrivalAt: raw.arrivalAt }).subscribe((response) => this.result.set(JSON.stringify(response, null, 2)));
  }

  absence(authorized: boolean): void {
    const raw = this.form.getRawValue();
    this.api.post('/attendance/absence', { meetingId: raw.meetingId, memberId: raw.memberId, authorized }).subscribe((response) => this.result.set(JSON.stringify(response, null, 2)));
  }
}
