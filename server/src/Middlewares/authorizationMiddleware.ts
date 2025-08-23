import { Request, Response, NextFunction } from "express";
import { Role } from "../Domain/enum/Role";

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
}