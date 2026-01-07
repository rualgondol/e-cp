
export enum ClubType {
  AVENTURIERS = 'AVENTURIERS',
  EXPLORATEURS = 'EXPLORATEURS'
}

export type InstructorRole = 'ADMIN' | 'AVENTURIERS' | 'EXPLORATEURS';

export type Instructor = {
  id: string;
  fullName: string;
  username: string;
  password: string;
  role: InstructorRole;
};

export type QuizQuestion = {
  text: string;
  options: string[];
  correctIndex: number;
};

export type Subject = {
  id: string;
  name: string;
  prerequisite: string;
  content: string;
  quiz?: QuizQuestion[];
};

export type ClassLevel = {
  id: string;
  name: string;
  age: number;
  club: ClubType;
  icon?: string;
};

export type Session = {
  id: string;
  club: ClubType;
  classId: string;
  number: number;
  subjects: Subject[];
  availabilityDate: string;
};

export type EmergencyContact = {
  name: string;
  phone: string;
  relationship: string;
};

export type Student = {
  id: string;
  fullName: string;
  birthDate: string;
  age: number;
  classId: string;
  photo?: string;
  address: string;
  motherName: string;
  fatherName: string;
  emergencyContacts: EmergencyContact[];
  diseases: string[];
  allergies: string[];
  medications: string[];
  passwordChanged: boolean;
  temporaryPassword?: string;
};

export type Progress = {
  studentId: string;
  sessionId: string;
  score: number;
  completed: boolean;
  completedSubjects: string[];
  completionDate: string;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
};
