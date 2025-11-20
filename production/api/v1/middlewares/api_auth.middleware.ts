import { Request, Response, NextFunction } from "express";
import { authenticatorHandler } from "./authenticator.middleware";

export function authenticatorWithExempt(req: Request, res: Response, next: NextFunction) {
    if (req.baseUrl.startsWith("/api/v1/unauth")) {
        return next();
    }

    return authenticatorHandler(req, res, next);
}

