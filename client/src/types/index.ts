export interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  adNumber: string;
  photoUrl?: string;
  classId?: number;
  class?: number;
  dvtMarks?: Array<{
    subject: string;
    mark: number;
    date: string;
    punishment?: string;
  }>;
}

export interface DvtMark {
  _id: string;
  studentId: string;
  subject: string;
  mark: number;
  punishment?: string;
  date: string;
  class: number;
}

export interface SubjectInfo {
  subject: string;
  class: number;
}

export interface ClassInfo {
  id: number;
  name: string;
} 