import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { Page } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class SharedResourceService {
  private readonly api = inject(ApiService);

  page<T>(path: string): Observable<Page<T>> {
    return this.api.page<T>(path, 0, 100);
  }

  get<T>(path: string): Observable<T> {
    return this.api.get<T>(path);
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.api.post<T>(path, body);
  }

  patch<T>(path: string, body: unknown = {}): Observable<T> {
    return this.api.patch<T>(path, body);
  }
}
