export class NotePublicDTO {
    constructor(
        public title: string = '',
        public content: string = '',
        public imageUrl: string | null = null,
        public createdAt: Date = new Date()
    ) {}
}