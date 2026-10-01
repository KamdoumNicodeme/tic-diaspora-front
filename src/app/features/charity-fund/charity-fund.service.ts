import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CharityMovement, CharitySummary, Page } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';

export interface CharityOutcomePayload {
  projectId?: string | null;
  amount: number;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class CharityFundService {
  private readonly api = inject(ApiService);

  summary(): Observable<CharitySummary> {
    return this.api.get<CharitySummary>('/charity-fund');
  }

  movements(): Observable<Page<CharityMovement>> {
    return this.api.page<CharityMovement>('/charity-fund/movements', 0, 100);
  }

  outcome(payload: CharityOutcomePayload): Observable<CharityMovement> {
    return this.api.post<CharityMovement>('/charity-fund/outcomes', payload);
  }
}
