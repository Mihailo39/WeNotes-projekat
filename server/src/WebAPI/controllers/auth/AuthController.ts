import { Request, Response, Router } from "express";
import { IAuthService } from "../../../Domain/services/auth/IAuthService";
import { dataValidationAuth } from "../../validators/auth/RegisterValidator";
import { loginValidationAuth } from "../../validators/auth/LoginValidator"
import { loginLimiter, refreshLimiter } from "../../../Middlewares/rateLimiter";
import { refreshCookieName, refreshCookieOptions } from "../../../utils/cookies";
import { toUserLoginDTO } from "../../../Domain/mappers/userMappers";
import { success } from "zod";
import { authenticateJWT } from "../../../Middlewares/authenticationMiddleware";

export class AuthController  {
    private readonly router: Router;

    constructor(private readonly authService: IAuthService) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post('/register', this.register.bind(this));
        this.router.post('/login',      loginLimiter,      this.login.bind(this));
        this.router.post("/refresh",        refreshLimiter,     this.refresh.bind(this));
        this.router.get("/refresh",         refreshLimiter,     this.refresh.bind(this));
        this.router.post("/logout",     authenticateJWT,    this.logout.bind(this));
    }

    private async register(req: Request, res: Response): Promise<void> {
        try {

        const {username, password, role} = req.body;

        const validation = dataValidationAuth(username, password, role);
        if (!validation.success) {
            res.status(400).json({ success: false, message: validation.message });
            return;
        }

        const result = await this.authService.register(username, password, role);

        if (!result) {
            res.status(409).json({ success: false, message: 'User already exists' });
            return;
        }

        const dto = toUserLoginDTO(result.user, result.accessToken);
        res.cookie(refreshCookieName, result.refreshToken, refreshCookieOptions)
           .status(201)
           .json({ success: true, data: dto});
        } catch (err) {
            console.error(err);
            res.status(500)
               .json({ success: false, message: "Internal Server Error" });
        }
    }

    private async login(req: Request, res: Response): Promise<void> {
        try {
            const { username, password } = req.body;

            const validation = loginValidationAuth(username, password);
            if (!validation.success) {
                res.status(400).json({ success: false, message: validation.message });
                return;
            }

            const result = await this.authService.login(username, password);
            
            const dto = toUserLoginDTO(result.user, result.accessToken);
            res.cookie(refreshCookieName, result.refreshToken, refreshCookieOptions)
               .status(200)
               .json({ success: true, data: dto });
        } catch (err: any) {
            console.error(err);
            
            if (err.message === 'User not found') {
                res.status(401).json({ success: false, message: 'Korisnik sa tim korisničkim imenom ne postoji.' });
            } else if (err.message === 'Invalid password') {
                res.status(401).json({ success: false, message: 'Pogrešna lozinka.' });
            } else {
                res.status(500).json({ success: false, message: "Internal Server Error" });
            }
        }
    }

    public async refresh(req: Request, res: Response): Promise<void> {
        try {
            const refreshToken = req.cookies?.[refreshCookieName] || req.body?.refreshToken;
            if (!refreshToken) {
                res.status(401).json({ success: false, message: "No refresh token" });
                    return;
            }

            const result = await this.authService.refresh(refreshToken);
            if (!result) {
                res.clearCookie(refreshCookieName, { path: refreshCookieOptions.path })
                res.status(401).json({ success: false, message: "Invalid refresh token" });
                return;
            }

            const dto = toUserLoginDTO(result.user, result.accessToken);
            res.cookie(refreshCookieName, result.refreshToken, refreshCookieOptions)
               .status(200)
               .json({ success: true, data: dto });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    private async logout(req: Request, res: Response): Promise<void> {
    try {
       const userId = req.user?.id;
       if (!userId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
       await this.authService.logoutAll(userId);

      res.clearCookie(refreshCookieName, { path: refreshCookieOptions.path });
      res.status(204).send();
        } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}