import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Decision, DecisionPriority, Page, Project, ProjectStatus } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';

export interface ProjectPayload {
  title: string;
  description: string;
  responsibleId?: string | null;
  status: ProjectStatus;
  estimatedBudget: number;
  realBudget: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ProjectDecisionPayload {
  projectId: string;
  title: string;
  description: string;
  responsibleId?: string | null;
  dueDate?: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  priority: DecisionPriority;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly api = inject(ApiService);

  list(status?: ProjectStatus | ''): Observable<Page<Project>> {
    return this.api.get<Page<Project>>('/projects', {
      page: 0,
      size: 100,
      status: status || undefined
    });
  }

  create(payload: ProjectPayload): Observable<Project> {
    return this.api.post<Project>('/projects', payload);
  }

  update(id: string, payload: ProjectPayload): Observable<Project> {
    return this.api.put<Project>(`/projects/${id}`, payload);
  }

  changeStatus(id: string, status: ProjectStatus): Observable<Project> {
    return this.api.patch<Project>(`/projects/${id}/status`, { status });
  }

  decisions(projectId: string): Observable<Decision[]> {
    return this.api.get<Decision[]>(`/decisions/project/${projectId}`);
  }

  createDecision(payload: ProjectDecisionPayload): Observable<Decision> {
    return this.api.post<Decision>('/decisions', {
      meetingId: null,
      ...payload
    });
  }
}
