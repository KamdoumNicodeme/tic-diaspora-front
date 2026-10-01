import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Decision, DecisionPriority, Member, Project, ProjectStatus } from '../../core/models/api.models';
import { MemberService } from '../members/member.service';
import { ProjectPayload, ProjectService } from './project.service';

type ProjectStatusFilter = ProjectStatus | '';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './projects-page.component.html',
  styleUrl: './projects-page.component.css'
})
export class ProjectsPageComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly projectsService = inject(ProjectService);
  private readonly membersService = inject(MemberService);
  private readonly fb = inject(FormBuilder);

  protected readonly projects = signal<Project[]>([]);
  protected readonly members = signal<Member[]>([]);
  protected readonly editingProject = signal<Project | null>(null);
  protected readonly selectedProject = signal<Project | null>(null);
  protected readonly projectDecisions = signal<Decision[]>([]);
  protected readonly statusFilter = signal<ProjectStatusFilter>('');
  protected readonly message = signal('');
  protected readonly error = signal('');

  protected readonly statuses: ProjectStatus[] = ['PROPOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  protected readonly decisionPriorities: DecisionPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(8)]],
    responsibleId: [''],
    status: ['PROPOSED' as ProjectStatus, Validators.required],
    estimatedBudget: [0, [Validators.required, Validators.min(0)]],
    realBudget: [0, [Validators.required, Validators.min(0)]],
    startDate: [''],
    endDate: ['']
  });
  protected readonly decisionForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(8)]],
    responsibleId: [''],
    dueDate: [''],
    priority: ['MEDIUM' as DecisionPriority, Validators.required]
  });

  protected readonly activeProjectsCount = computed(() =>
    this.projects().filter((project) => project.status === 'APPROVED' || project.status === 'IN_PROGRESS').length
  );
  protected readonly totalEstimatedBudget = computed(() =>
    this.projects().reduce((total, project) => total + project.estimatedBudget, 0)
  );
  protected readonly totalRealBudget = computed(() =>
    this.projects().reduce((total, project) => total + project.realBudget, 0)
  );
  protected readonly openDecisionsCount = computed(() =>
    this.projects().reduce((total, project) => total + project.openDecisionsCount, 0)
  );

  ngOnInit(): void {
    this.load();
    this.membersService.list().subscribe((page) => this.members.set(page.content));
  }

  load(): void {
    this.projectsService.list(this.statusFilter()).subscribe((page) => {
      this.projects.set(page.content);
      const selected = this.selectedProject();
      if (selected) {
        this.selectedProject.set(page.content.find((project) => project.id === selected.id) ?? null);
      }
    });
  }

  filter(status: ProjectStatusFilter): void {
    this.statusFilter.set(status);
    this.load();
  }

  save(): void {
    if (this.form.invalid || !this.auth.isPresident()) {
      return;
    }
    this.message.set('');
    this.error.set('');
    const payload = this.payload();
    const current = this.editingProject();
    const request = current
      ? this.projectsService.update(current.id, payload)
      : this.projectsService.create(payload);

    request.subscribe({
      next: () => {
        this.message.set(current ? 'Projet mis à jour.' : 'Projet créé.');
        this.resetForm();
        this.load();
      },
      error: () => this.error.set("Impossible d'enregistrer le projet.")
    });
  }

  edit(project: Project): void {
    this.editingProject.set(project);
    this.form.reset({
      title: project.title,
      description: project.description,
      responsibleId: project.responsibleId ?? '',
      status: project.status,
      estimatedBudget: project.estimatedBudget,
      realBudget: project.realBudget,
      startDate: project.startDate ?? '',
      endDate: project.endDate ?? ''
    });
  }

  resetForm(): void {
    this.editingProject.set(null);
    this.form.reset({
      title: '',
      description: '',
      responsibleId: '',
      status: 'PROPOSED',
      estimatedBudget: 0,
      realBudget: 0,
      startDate: '',
      endDate: ''
    });
  }

  changeStatus(project: Project, status: ProjectStatus): void {
    if (!this.auth.isPresident()) {
      return;
    }
    this.projectsService.changeStatus(project.id, status).subscribe(() => this.load());
  }

  selectProject(project: Project): void {
    this.selectedProject.set(project);
    this.projectsService.decisions(project.id).subscribe((items) => this.projectDecisions.set(items));
  }

  createDecision(): void {
    const project = this.selectedProject();
    if (!project || this.decisionForm.invalid || !this.auth.isPresident()) {
      return;
    }
    const value = this.decisionForm.getRawValue();
    this.projectsService.createDecision({
      projectId: project.id,
      title: value.title.trim(),
      description: value.description.trim(),
      responsibleId: value.responsibleId || null,
      dueDate: value.dueDate || null,
      status: 'OPEN',
      priority: value.priority
    }).subscribe(() => {
      this.decisionForm.reset({
        title: '',
        description: '',
        responsibleId: '',
        dueDate: '',
        priority: 'MEDIUM'
      });
      this.selectProject(project);
      this.load();
    });
  }

  protected statusLabel(status: ProjectStatus): string {
    return {
      PROPOSED: 'Proposé',
      APPROVED: 'Approuvé',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminé',
      CANCELLED: 'Annulé'
    }[status];
  }

  protected statusClass(status: ProjectStatus): string {
    return {
      PROPOSED: 'bg-stone-100 text-stone-700 dark:bg-white/10 dark:text-stone-200',
      APPROVED: 'bg-ocean/10 text-ocean dark:bg-blue-300/10 dark:text-blue-100',
      IN_PROGRESS: 'bg-mint/10 text-mint dark:bg-emerald-300/10 dark:text-emerald-100',
      COMPLETED: 'bg-plum/10 text-plum dark:bg-violet-300/10 dark:text-violet-100',
      CANCELLED: 'bg-coral/10 text-coral dark:bg-red-300/10 dark:text-red-100'
    }[status];
  }

  protected decisionPriorityLabel(priority: DecisionPriority): string {
    return {
      LOW: 'Basse',
      MEDIUM: 'Moyenne',
      HIGH: 'Haute'
    }[priority];
  }

  protected decisionStatusLabel(status: Decision['status']): string {
    return {
      OPEN: 'Ouverte',
      IN_PROGRESS: 'En cours',
      DONE: 'Terminée',
      CANCELLED: 'Annulée'
    }[status];
  }

  protected money(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value) + ' XAF';
  }

  protected budgetProgress(project: Project): number {
    if (project.estimatedBudget <= 0) {
      return project.realBudget > 0 ? 100 : 0;
    }
    return Math.min(100, Math.round((project.realBudget / project.estimatedBudget) * 100));
  }

  private payload(): ProjectPayload {
    const value = this.form.getRawValue();
    return {
      title: value.title.trim(),
      description: value.description.trim(),
      responsibleId: value.responsibleId || null,
      status: value.status,
      estimatedBudget: value.estimatedBudget,
      realBudget: value.realBudget,
      startDate: value.startDate || null,
      endDate: value.endDate || null
    };
  }
}
