import { NextFunction, Request, Response } from "express";
import { UserRole } from "../types/user";
import { auth as betterAuth } from "../lib/auth";



const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const session = await betterAuth.api.getSession();
        console.log("Session:", session); // Debugging line

        if (!session) {
            return res.status(401).json({ message: "Unauthorized , please login or register first" });
        }
        if (!session.user.emailVerified) {
            return res.status(403).json({ success: false, message: "Forbidden, please verify your email first" });
        }
        const sessionUserRole = session.user.role;

        req.user = {
            id: session.user.id,
            email: session.user.email,
            emailVerified: session.user.emailVerified,
            name: session.user.name,
            role: sessionUserRole as UserRole,
            status: session.user.status
        }
        if (roles.length > 0 && !roles.includes(sessionUserRole as UserRole)) {
            return res.status(403).json({ success: false, message: "Forbidden you don't have permission to access this resources" });
        }

        next();
    }
}