export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export type ApplicationRole = 'MEMBER' | 'PRESIDENT';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type ContributionType = 'XAF_50000' | 'XAF_100000';
export type MeetingStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type AttendanceStatus = 'PRESENT_ON_TIME' | 'LATE_10' | 'LATE_20' | 'ABSENT_AUTHORIZED' | 'ABSENT_UNAUTHORIZED' | 'ABSENT_FROM_DELAY';
export type AbsenceRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED' | 'LATE_REQUEST';
export type ContributionStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'LATE' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'OTHER';
export type TontineCycleStatus = 'PLANNED' | 'OPEN' | 'COLLECTION_IN_PROGRESS' | 'READY_TO_PAY' | 'PAID' | 'CLOSED' | 'CANCELLED';
export type ProjectStatus = 'PROPOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type DecisionStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type DecisionPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type CharityMovementType = 'PENALTY_INCOME' | 'MANUAL_INCOME' | 'CHARITY_OUTCOME' | 'ADJUSTMENT';
export type PenaltyType = 'LATE_10' | 'LATE_20' | 'ABSENCE' | 'ABSENT_FROM_DELAY';
export type PenaltyStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'WAIVED';

export interface AuthToken {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  memberId: string;
  role: ApplicationRole;
  email: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  fullAddress?: string;
  joinedAt: string;
  status: MemberStatus;
  role: ApplicationRole;
  contributionType: ContributionType;
  photoUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  orangeMoneyNumber?: string;
  orangeMoneyAccountName?: string;
  mtnMoneyNumber?: string;
  mtnMoneyAccountName?: string;
  totalMeetingsChaired: number;
  lastChairedAt?: string;
  annualAuthorizedAbsences: number;
  annualUnauthorizedAbsences: number;
  totalPenaltiesAmount: number;
  unpaidPenaltiesAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  meetingDate: string;
  plannedStartTime: string;
  plannedEndTime: string;
  onlineLink?: string;
  status: MeetingStatus;
  chairpersonId?: string;
  chairpersonFullName?: string;
  beneficiaryId?: string;
  beneficiaryFullName?: string;
  beneficiaryOrangeMoneyNumber?: string;
  beneficiaryOrangeMoneyAccountName?: string;
  beneficiaryMtnMoneyNumber?: string;
  beneficiaryMtnMoneyAccountName?: string;
  beneficiaryExpectedAmount: number;
  secondaryBeneficiaryId?: string;
  secondaryBeneficiaryFullName?: string;
  secondaryBeneficiaryOrangeMoneyNumber?: string;
  secondaryBeneficiaryOrangeMoneyAccountName?: string;
  secondaryBeneficiaryMtnMoneyNumber?: string;
  secondaryBeneficiaryMtnMoneyAccountName?: string;
  secondaryBeneficiaryExpectedAmount: number;
  notes?: string;
  decisionsSummary?: string;
  projectsSummary?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface AbsenceRequest {
  id: string;
  memberId: string;
  memberFullName: string;
  meetingId: string;
  meetingTitle: string;
  meetingDate?: string;
  plannedStartTime?: string;
  reason: string;
  requestedAt: string;
  hoursBeforeMeeting: number;
  status: AbsenceRequestStatus;
  validationComment?: string;
  validatedBy?: string;
  validatedAt?: string;
  exceptionalApproval: boolean;
}

export interface TontineCycle {
  id: string;
  month: number;
  year: number;
  beneficiaryId?: string;
  beneficiaryFullName?: string;
  beneficiaryOrangeMoneyNumber?: string;
  beneficiaryOrangeMoneyAccountName?: string;
  beneficiaryMtnMoneyNumber?: string;
  beneficiaryMtnMoneyAccountName?: string;
  beneficiaryExpectedAmount: number;
  secondaryBeneficiaryId?: string;
  secondaryBeneficiaryFullName?: string;
  secondaryBeneficiaryOrangeMoneyNumber?: string;
  secondaryBeneficiaryOrangeMoneyAccountName?: string;
  secondaryBeneficiaryMtnMoneyNumber?: string;
  secondaryBeneficiaryMtnMoneyAccountName?: string;
  secondaryBeneficiaryExpectedAmount: number;
  status: TontineCycleStatus;
  expectedAmount: number;
  collectedAmount: number;
  transferredAmount: number;
  remainingAmount: number;
  openedAt?: string;
  closedAt?: string;
  comment?: string;
}

export interface Contribution {
  id: string;
  cycleId: string;
  memberId: string;
  memberFullName?: string;
  expectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  status: ContributionStatus;
  paidAt?: string;
  validatedBy?: string;
  validatedAt?: string;
  lastPaymentMethod?: PaymentMethod;
  lastTransactionReference?: string;
  lastProofUrl?: string;
  lastPaymentAt?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  responsibleId?: string;
  responsibleFullName?: string;
  status: ProjectStatus;
  estimatedBudget: number;
  realBudget: number;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  decisionsCount: number;
  openDecisionsCount: number;
}

export interface Decision {
  id: string;
  meetingId?: string;
  projectId?: string;
  title: string;
  description: string;
  responsibleId?: string;
  dueDate?: string;
  status: DecisionStatus;
  priority: DecisionPriority;
  createdAt: string;
  updatedAt?: string;
}

export interface CharitySummary {
  balance: number;
  totalIncome: number;
  totalOutcome: number;
  currentYearIncome: number;
  currentYearOutcome: number;
  movementsCount: number;
}

export interface CharityMovement {
  id: string;
  memberId?: string;
  penaltyId?: string;
  projectId?: string;
  memberFullName?: string;
  projectTitle?: string;
  type: CharityMovementType;
  amount: number;
  description: string;
  movementDate: string;
  createdBy?: string;
  createdByFullName?: string;
}

export interface Penalty {
  id: string;
  memberId: string;
  memberFullName?: string;
  meetingId?: string;
  meetingTitle?: string;
  type: PenaltyType;
  amount: number;
  status: PenaltyStatus;
  reason: string;
  createdAt: string;
  paidAt?: string;
  validatedBy?: string;
  validatedByFullName?: string;
  cancellationReason?: string;
}

export interface PenaltySummary {
  totalCount: number;
  pendingCount: number;
  paidCount: number;
  waivedCount: number;
  cancelledCount: number;
  pendingAmount: number;
  paidAmount: number;
  waivedAmount: number;
  cancelledAmount: number;
}

export interface DashboardSummary {
  totalMembers: number;
  activeMembers: number;
  suspendedMembers: number;
  nextMeetingId?: string;
  nextMeetingTitle?: string;
  nextMeetingDate?: string;
  plannedChairpersonId?: string;
  plannedChairpersonFullName?: string;
  currentBeneficiaryId?: string;
  currentBeneficiaryFullName?: string;
  secondaryBeneficiaryId?: string;
  secondaryBeneficiaryFullName?: string;
  tontineExpectedAmount: number;
  tontineCollectedAmount: number;
  tontineRemainingAmount: number;
  debtorMembers: MemberNameSummary[];
  pendingPenaltiesAmount: number;
  charityFundBalance: number;
  unauthorizedAbsencesThisYear: number;
  closeToAbsenceThreshold: MemberRisk[];
  exceededAbsenceThreshold: MemberRisk[];
  ongoingProjects: number;
  openDecisions: number;
}

export interface MemberNameSummary {
  memberId: string;
  firstName: string;
  lastName: string;
}

export interface MemberRisk {
  memberId: string;
  firstName: string;
  lastName: string;
  unauthorizedAbsences: number;
}
