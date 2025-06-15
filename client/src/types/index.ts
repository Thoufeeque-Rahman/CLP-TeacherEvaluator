export interface Student {
  _id: number;
  name: string;
  rollNumber: string;
  adNumber: string;
  photoUrl: string | null;
  classId: number;
  dvtMarks?: string[];
}

export interface DvtMark {
  _id: string;
  studentId: number;
  subject: string;
  mark: number;
  punishment?: string;
  date: string;
}

export interface SubjectInfo {
  subject: string;
  class: number;
}

export interface ClassInfo {
  id: number;
  name: string;
} 