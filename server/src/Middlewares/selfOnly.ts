import { Request, Response, NextFunction } from "express";
//self only je trenutno ako se odlucim da dodam admina ici ce self or admin.

export function selfOnly(paramUserIdName = "id") {
  return (req: Request, res: Response, next: NextFunction) => {
    const authUser = req.user;
    const targetId = Number(req.params[paramUserIdName]);
    if (!authUser) return res.status(401).json({ message: "Unauthorized" });
    if (authUser.id !== targetId) return res.status(403).json({ message: "Access denied" });
    return next();
  };
}