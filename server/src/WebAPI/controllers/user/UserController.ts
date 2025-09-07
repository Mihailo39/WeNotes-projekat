import { Request, Response, Router } from "express";
import { authenticateJWT } from "../../../Middlewares/authenticationMiddleware";
import { selfOnly } from "../../../Middlewares/selfOnly";
import { validateBody } from "../../../Middlewares/validate";
import { userUpdateSchema } from "../../validators/user/UserUpdateValidator";
import { IUserService } from "../../../Domain/services/user/IUserService";
import { IUserRepository } from "../../../Domain/repositories/users/IUserRepository";
import bcrypt from "bcryptjs";
import { refreshCookieName, refreshCookieOptions } from "../../../utils/cookies";
import { toUserPublicDTO } from "../../../Domain/mappers/userMappers";

export class UserController {
  private readonly router: Router;

  constructor(
    private readonly userService: IUserService,
    private readonly userRepository: IUserRepository
  ) {
    this.router = Router();
    this.init();
  }

  private init() {
    this.router.get("/users/me", authenticateJWT, this.me.bind(this));

    this.router.patch(
      "/users/:id",
      authenticateJWT,
      selfOnly("id"),
      validateBody(userUpdateSchema),
      this.updateUser.bind(this)
    );

    this.router.delete(
      "/users/:id",
      authenticateJWT,
      selfOnly("id"),
      this.deleteMe.bind(this)
    );
  }

  private async me(req: Request, res: Response) {
    const u = req.user!;
    res.json({ success: true, data: toUserPublicDTO(u as any) });
  }

  private async updateUser(req: Request, res: Response) {
    const targetId = Number(req.params.id);
    const { username, role, newPassword, currentPassword } = req.body as {
      username?: string; role?: any; newPassword?: string; currentPassword?: string;
    };

    // ako se menja lozinka onda potvrdi currentPassword ovde ili u servisu
    const changingPassword = !!newPassword;
    if (changingPassword) {
      const current = await this.userRepository.getById(targetId);
      if (!current) return res.status(404).json({ success: false, message: "User not found" });

      const ok = await bcrypt.compare(currentPassword ?? "", current.password);
      if (!ok) return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const payload = {
    id: targetId,
    ...(username !== undefined ? { username } : {}),
    ...(role !== undefined ? { role } : {}),
    ...(newPassword !== undefined ? { newPassword } : {})
    };
    const updated = await this.userService.updateUser(payload);
    if (!updated) {
      return res.status(400).json({ success: false, message: "Update failed" });
    }

    // ako je menjana lozinka onda klijenta izloguj
    if (changingPassword) {
      // ako radiš revokeAll u servisu AuthService, pozovi ga ovde i očisti cookie
      res.clearCookie(refreshCookieName, { path: refreshCookieOptions.path });
    }

    return res.status(200).json({ success: true, data: toUserPublicDTO(updated) });
  }

  private async deleteMe(req: Request, res: Response) {
    const targetId = Number(req.params.id);
    const { currentPassword } = req.body as { currentPassword?: string };
    if (!currentPassword) {
      return res.status(400).json({ success: false, message: "currentPassword is required" });
    }

    const ok = await this.userService.deleteSelf(targetId, currentPassword);
    if (!ok) return res.status(401).json({ success: false, message: "Invalid password" });

    res.clearCookie(refreshCookieName, { path: refreshCookieOptions.path });
    return res.status(204).send();
  }

  public getRouter(): Router {
    return this.router;
  }
}
