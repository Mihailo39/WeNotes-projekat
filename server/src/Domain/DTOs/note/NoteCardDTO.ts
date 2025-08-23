export class NoteCardDTO {
  constructor(
    public id: number,
    public title: string,
    public preview: string,   // prvih 50 karaktera content-a
    public imageUrl: string | null,
    public isPinned: boolean,
    public updatedAt: Date
  ) {}
}
