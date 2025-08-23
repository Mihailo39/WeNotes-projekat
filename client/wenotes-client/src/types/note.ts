export interface Note {
  id: number;
  title: string;
  content: string;
  isPublic: boolean;
  isPinned: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoteCard {
  id: number;
  title: string;
  content: string;
  isPublic: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  isPublic: boolean;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  isPublic?: boolean;
  isPinned?: boolean;
}
