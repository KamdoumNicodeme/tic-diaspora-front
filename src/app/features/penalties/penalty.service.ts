import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Page, Penalty, PenaltyStatus, PenaltySummary, PenaltyType } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';

export interface PenaltyPayload {
  memberId: string;
  meetingId?: string | null;
  type: PenaltyType;
  amount: number;
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class PenaltyService {
  private readonly api = inject(ApiService);

  list(status?: PenaltyStatus | ''): Observable<Page<Penalty>> {
    return this.api.get<Page<Penalty>>('/penalties', {
      page: 0,
      size: 100,
      status: status || undefined
    });
  }

  mine(memberId: string): Observable<Penalty[]> {
    return this.api.get<Penalty[]>(`/members/${memberId}/penalties`);
  }

  summary(): Observable<PenaltySummary> {
    return this.api.get<PenaltySummary>('/penalties/summary');
  }

  create(payload: PenaltyPayload): Observable<Penalty> {
    return this.api.post<Penalty>('/penalties', payload);
  }

  pay(id: string): Observable<Penalty> {
    return this.api.patch<Penalty>(`/penalties/${id}/pay`);
  }

  waive(id: string, reason: string): Observable<Penalty> {
    return this.api.patch<Penalty>(`/penalties/${id}/waive`, { reason });
  }
}
