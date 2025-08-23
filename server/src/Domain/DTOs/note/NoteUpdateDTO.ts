export type NoteUpdateDTO = Partial<{
  title: string;
  content: string;
  imageUrl: string | null;
}>;
