import { Request, Response, Router } from "express";
import { INoteService } from "../../../Domain/services/note/INoteService";
import { authenticateJWT } from "../../../Middlewares/authenticationMiddleware";
import { toNoteDTO, toNoteDTOList } from "../../../Domain/mappers/noteMappers";

export class NoteController {
    private readonly router: Router;

    constructor(private readonly noteService: INoteService) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post("/", authenticateJWT, this.create.bind(this));
        this.router.get("/", authenticateJWT, this.getAll.bind(this));
        this.router.get("/:id", authenticateJWT, this.getById.bind(this));
        this.router.get("/by-title/:title", authenticateJWT, this.getByTitle.bind(this));
        this.router.patch("/:id", authenticateJWT, this.update.bind(this));
        this.router.delete("/:id", authenticateJWT, this.remove.bind(this));
        this.router.post("/:id/toggle-pin", authenticateJWT, this.togglePin.bind(this));
        this.router.post("/:id/duplicate", authenticateJWT, this.duplicate.bind(this));
        this.router.post("/:id/share", authenticateJWT, this.share.bind(this));
        // public shared note endpoint
        this.router.get("/shared/:token", this.getSharedByToken.bind(this));
    }

    private async create(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
            const created = await this.noteService.createNote(user.id, user.role, req.body);
            if (!created) { res.status(400).json({ success: false, message: "Unable to create note" }); return; }
            res.status(201).json({ success: true, data: toNoteDTO(created) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    private async getAll(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
            const list = await this.noteService.getAllUserNotes(user.id);
            res.status(200).json({ success: true, data: toNoteDTOList(list) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    private async getById(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
            const id = Number(req.params.id);
            const note = await this.noteService.getNoteById(user.id, id);
            if (!note) { res.status(404).json({ success: false, message: "Not found" }); return; }
            res.status(200).json({ success: true, data: toNoteDTO(note) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    private async getByTitle(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
            const title = req.params.title;
            if (!title) { res.status(400).json({ success: false, message: "Title is required" }); return; }
            const notes = await (this.noteService as any).getNotesByTitle?.(user.id, title);
            if (!notes || notes.length === 0) { res.status(200).json({ success: true, data: [] }); return; }
            res.status(200).json({ success: true, data: toNoteDTOList(notes) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    private async update(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
            const id = Number(req.params.id);
            const updated = await this.noteService.updateNote(user.id, user.role, id, req.body);
            if (!updated) { res.status(403).json({ success: false, message: "Forbidden" }); return; }
            res.status(200).json({ success: true, data: toNoteDTO(updated) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    private async remove(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
            const id = Number(req.params.id);
            const ok = await this.noteService.deleteNote(user.id, id);
            if (!ok) { res.status(403).json({ success: false, message: "Forbidden" }); return; }
            res.status(204).send();
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    private async togglePin(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
            const id = Number(req.params.id);
            const updated = await this.noteService.togglePin(user.id, id);
            if (!updated) { res.status(404).json({ success: false, message: "Not found" }); return; }
            res.status(200).json({ success: true, data: toNoteDTO(updated) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    private async duplicate(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
            const id = Number(req.params.id);
            const duplicated = await this.noteService.duplicateNote(user.id, id, user.role);
            if (!duplicated) { res.status(400).json({ success: false, message: "Unable to duplicate" }); return; }
            res.status(201).json({ success: true, data: toNoteDTO(duplicated) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    private async share(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
            const id = Number(req.params.id);
            const shared = await this.noteService.shareNote(user.id, id);
            if (!shared) { res.status(403).json({ success: false, message: "Forbidden" }); return; }
            res.status(200).json({ success: true, data: { note: toNoteDTO(shared), sharedToken: shared.sharedToken } });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    private async getSharedByToken(req: Request, res: Response): Promise<void> {
        try {
            const token = req.params.token;
            if (!token) { res.status(400).json({ success: false, message: "Token is required" }); return; }
            const note = await this.noteService.getSharedNoteByToken(token);
            if (!note) { res.status(404).json({ success: false, message: "Not found" }); return; }
            res.status(200).json({ success: true, data: toNoteDTO(note) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}


