export type Gender = 'MALE' | 'FEMALE';

export interface Person {
  id: string;
  name: string;
  gender: Gender;
  generation: number; // 1 for oldest, 2 for next, etc.
  birthDate?: string;
  deathDate?: string;
  photoUrl?: string;
  phone?: string;
  address?: string;
  latLong?: string;
  bio?: string;
}

export interface Relationship {
  id: string;
  personId: string;
  partnerId: string;
  type: 'MARRIED' | 'DIVORCED' | 'PARTNER';
}

export interface ParentChild {
  parentId: string;
  childId: string;
}

export const mockPeople: Person[] = [
  {
    id: '1',
    name: 'Simbah Buyut Ahmad',
    gender: 'MALE',
    generation: 1,
    birthDate: '1920-05-15',
    deathDate: '1995-10-20',
    bio: 'Pendiri keluarga besar yang bijaksana.',
    address: 'Sleman, Yogyakarta',
  },
  {
    id: '2',
    name: 'Simbah Buyut Siti',
    gender: 'FEMALE',
    generation: 1,
    birthDate: '1925-08-10',
    deathDate: '2000-02-12',
    address: 'Sleman, Yogyakarta',
  },
  {
    id: '3',
    name: 'Bapak Subarjo',
    gender: 'MALE',
    generation: 2,
    birthDate: '1950-03-20',
    phone: '08123456789',
    address: 'Bantul, Yogyakarta',
  },
  {
    id: '4',
    name: 'Ibu Ratna',
    gender: 'FEMALE',
    generation: 2,
    birthDate: '1955-09-05',
    phone: '08198765432',
    address: 'Bantul, Yogyakarta',
  },
  {
    id: '5',
    name: 'Ananda Putra',
    gender: 'MALE',
    generation: 3,
    birthDate: '1980-01-15',
    phone: '08564321098',
    address: 'Jakarta Selatan',
  },
  {
    id: '6',
    name: 'Ananda Putri',
    gender: 'FEMALE',
    generation: 3,
    birthDate: '1985-06-25',
    phone: '08122334455',
    address: 'Bandung',
  },
];

export const mockRelationships: Relationship[] = [
  { id: 'r1', personId: '1', partnerId: '2', type: 'MARRIED' },
  { id: 'r2', personId: '3', partnerId: '4', type: 'MARRIED' },
];

export const mockParentChild: ParentChild[] = [
  { parentId: '1', childId: '3' },
  { parentId: '2', childId: '3' },
  { parentId: '3', childId: '5' },
  { parentId: '3', childId: '6' },
  { parentId: '4', childId: '5' },
  { parentId: '4', childId: '6' },
];
