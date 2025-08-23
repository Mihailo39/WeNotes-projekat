import { RequestHandler } from "express";
export const validateBody = (schema: any): RequestHandler => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  req.body = parsed.data; next();
};
export const validateQuery = (schema: any): RequestHandler => (req, res, next) => {
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  req.query = parsed.data; next();
};
