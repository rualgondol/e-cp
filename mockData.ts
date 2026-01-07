
import { Session, Student, Progress, ClubType, Message } from './types';
import { CLASSES } from './constants';

const generateStudents = () => {
  const firstNames = ["Jean", "Marie", "Alice", "Lucas", "Léa", "Thomas", "Emma", "Hugo", "Chloé", "Nathan", "Zoe", "Gabriel", "Mila", "Arthur", "Jade", "Enzo"];
  const lastNames = ["Dupont", "Curie", "Martin", "Bernard", "Petit", "Roux", "Durand", "Leroy", "Simon", "Michel", "Lefebvre", "Garcia", "David", "Bonnet", "Morel", "Moret"];
  
  const students: Student[] = [];
  const currentYear = new Date().getFullYear();
  
  CLASSES.forEach((cls) => {
    for (let i = 0; i < 8; i++) {
      const fName = firstNames[(i + cls.age) % firstNames.length];
      const lName = lastNames[(i * 3 + cls.age) % lastNames.length];
      const fullName = `${fName} ${lName}`;
      const birthYear = currentYear - cls.age;
      
      students.push({
        id: `st-${cls.id}-${i}`,
        fullName: fullName,
        birthDate: `${birthYear}-05-15`,
        age: cls.age,
        classId: cls.id,
        address: "123 Rue de la Jeunesse, 75000 Paris",
        motherName: `Maman ${lName}`,
        fatherName: `Papa ${lName}`,
        emergencyContacts: [
          { name: `Oncle ${lName}`, phone: "06 12 34 56 78", relationship: "Oncle" },
          { name: `Tante ${lName}`, phone: "07 98 76 54 32", relationship: "Tante" }
        ],
        diseases: i % 5 === 0 ? ["Asthme"] : [],
        allergies: i % 4 === 0 ? ["Arachides"] : [],
        medications: i % 6 === 0 ? ["Ventoline"] : [],
        passwordChanged: i === 0,
        temporaryPassword: i !== 0 ? `MJA${1000 + i + cls.age}` : undefined
      });
    }
  });

  return students;
};

export const initialSessions: Session[] = [
  {
    id: 's1',
    club: ClubType.AVENTURIERS,
    classId: 'av1',
    number: 1,
    subjects: [
      { 
        id: 'sub1', 
        name: 'La Création', 
        prerequisite: 'Comprendre que Dieu est le Créateur de tout.', 
        content: '<h2>Leçon 1: Dieu est Créateur</h2><p>Dieu a fait le ciel, la terre, et tout ce qu\'ils contiennent parce qu\'il nous aime.</p>' 
      },
      { 
        id: 'sub2', 
        name: 'Les Animaux', 
        prerequisite: 'Découvrir la diversité des animaux créés.', 
        content: '<h2>Leçon 2: Les Animaux de Dieu</h2><p>Dieu a créé les animaux, du plus petit insecte au plus grand éléphant.</p>' 
      }
    ],
    availabilityDate: '2024-09-01'
  }
];

export const initialStudents: Student[] = generateStudents();
export const initialProgress: Progress[] = [];
export const initialMessages: Message[] = [];
