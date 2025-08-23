import { z } from "zod";

export const listNotesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  pinned: z.union([z.literal("true"), z.literal("false")]).transform(v => v === "true").optional(),
  projection: z.enum(["full", "card"]).optional().default("full")
});
export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;
