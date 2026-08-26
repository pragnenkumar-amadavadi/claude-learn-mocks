export interface Note {
  id: number;
  candidateId: number;
  body: string;
  createdAt: string;
}

export const notes: Note[] = [];
