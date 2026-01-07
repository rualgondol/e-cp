
import { ClubType, ClassLevel } from './types';

export const CLASSES: ClassLevel[] = [
  // Aventuriers
  { id: 'av1', club: ClubType.AVENTURIERS, name: 'Petit Agneau', age: 4, icon: '🐑' },
  { id: 'av2', club: ClubType.AVENTURIERS, name: 'Castor Enthousiaste', age: 5, icon: '🦫' },
  { id: 'av3', club: ClubType.AVENTURIERS, name: 'Abeille Active', age: 6, icon: '🐝' },
  { id: 'av4', club: ClubType.AVENTURIERS, name: 'Rayon de Soleil', age: 7, icon: '☀️' },
  { id: 'av5', club: ClubType.AVENTURIERS, name: 'Constructeur', age: 8, icon: '🛠️' },
  { id: 'av6', club: ClubType.AVENTURIERS, name: 'Main Utile', age: 9, icon: '✋' },
  // Explorateurs
  { id: 'ex1', club: ClubType.EXPLORATEURS, name: 'Ami', age: 10, icon: '🤝' },
  { id: 'ex2', club: ClubType.EXPLORATEURS, name: 'Compagnon', age: 11, icon: '🧭' },
  { id: 'ex3', club: ClubType.EXPLORATEURS, name: 'Explorateur', age: 12, icon: '⛺' },
  { id: 'ex4', club: ClubType.EXPLORATEURS, name: 'Pionnier', age: 13, icon: '🔥' },
  { id: 'ex5', club: ClubType.EXPLORATEURS, name: 'Voyageur', age: 14, icon: '🗺️' },
  { id: 'ex6', club: ClubType.EXPLORATEURS, name: 'Guide', age: 15, icon: '🌟' },
];

export const THEMES = {
  [ClubType.AVENTURIERS]: {
    primary: '#002366', // Royal Blue
    secondary: '#800020', // Bordeaux
    bg: '#ffffff',
    text: '#002366',
    sidebar: 'bg-[#002366]',
    accent: 'border-red-800'
  },
  [ClubType.EXPLORATEURS]: {
    primary: '#004225', // Bottle Green
    secondary: '#FFD700', // Yellow/Gold
    bg: '#ffffff',
    text: '#004225',
    sidebar: 'bg-[#004225]',
    accent: 'border-yellow-500'
  }
};
