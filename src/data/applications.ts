export interface Application {
  id: number;
  jobId: number;
  candidateId: number;
  status: 'pending';
  appliedAt: string;
}

export const applications: Application[] = [];
