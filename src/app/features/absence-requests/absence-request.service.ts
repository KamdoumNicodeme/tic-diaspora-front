import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AbsenceRequest, Page } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';

export interface CreateAbsenceRequestPayload {
  memberId: string;
  meetingId: string;
  reason: string;
}

export interface ValidateAbsenceRequestPayload {
  validationComment: string;
  exceptionalApproval: boolean;
}

@Injectable({ providedIn: 'root' })
export class AbsenceRequestService {
  private readonly api = inject(ApiService);

  list(): Observable<Page<AbsenceRequest>> {
    return this.api.page<AbsenceRequest>('/absence-requests', 0, 100);
  }

  mine(): Observable<AbsenceRequest[]> {
    return this.api.get<AbsenceRequest[]>('/absence-requests/mine');
  }

  create(body: CreateAbsenceRequestPayload): Observable<AbsenceRequest> {
    return this.api.post<AbsenceRequest>('/absence-requests', body);
  }

  approve(id: string, body: ValidateAbsenceRequestPayload): Observable<AbsenceRequest> {
    return this.api.patch<AbsenceRequest>(`/absence-requests/${id}/approve`, body);
  }

  reject(id: string, validationComment: string): Observable<AbsenceRequest> {
    return this.api.patch<AbsenceRequest>(`/absence-requests/${id}/reject`, {
      validationComment,
      exceptionalApproval: false
    });
  }
}
