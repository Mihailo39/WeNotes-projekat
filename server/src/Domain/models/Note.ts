export class Note {
    constructor(
        public id: number = 0,
        public userId: number = 0,
        public title: string = '',
        public content: string = '',
        public imageUrl: string | null = null,
        public isPinned: boolean = false,
        public isShared: boolean = false,
        public sharedToken: string | null = null,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) {}
}