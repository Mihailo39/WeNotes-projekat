import { Note } from "../models/Note";
import { NoteDTO } from "../DTOs/note/NoteDTO";
import { NotePublicDTO } from "../DTOs/note/NotePublicDTO";
import { NoteCreateDTO } from "../DTOs/note/NoteCreateDTO";

export function toNoteDTO(n: Note): NoteDTO {
  return new NoteDTO(
    n.id,
    n.title,
    n.content,
    n.imageUrl,
    n.isPinned,
    n.isShared,
    n.createdAt,
    n.updatedAt
  );
}

export function toNoteDTOList(list: Note[]): NoteDTO[] {
  return list.map(toNoteDTO);
}

export function toNotePublicDTO(n: Note): NotePublicDTO {
  return new NotePublicDTO(
    n.title,
    n.content,
    n.imageUrl,
    n.createdAt
  );
}

export function fromNoteCreateDTO(dto: NoteCreateDTO, userId: number): Note {
  return new Note(
    0,
    userId,
    dto.title,
    dto.content,
    dto.imageUrl ?? null,
    false,   // isPinned
    false,   // isShared
    null     // sharedToken
  );
}
