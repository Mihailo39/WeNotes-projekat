import { z } from "zod";
import { Role } from "../../../Domain/enum/Role";

export const userUpdateSchema = z.object({
  username: z.string().min(3).max(50).trim().optional(),
  newPassword: z.string().min(8).max(128).optional(),
  currentPassword: z.string().min(1).optional(),
  // ostavi role ovde samo ako ćeš imati admin endpoint; u suprotnom izbaci
  role: z.nativeEnum(Role).optional(),
}).refine(
  (v) => (v.newPassword ? !!v.currentPassword : true),
  { message: "currentPassword je obavezan kada menjaš lozinku", path: ["currentPassword"] }
);

export type UserUpdateBody = z.infer<typeof userUpdateSchema>;
