export interface Note {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  isPinned: boolean;
  isShared: boolean;
  sharedToken: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoteCard {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  isPinned: boolean;
  isShared: boolean;
  sharedToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  imageUrl?: string | null;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  imageUrl?: string | null;
  isPinned?: boolean;
}

export interface SharedNoteResponse {
  note: NoteCard;
  sharedToken: string;
}
