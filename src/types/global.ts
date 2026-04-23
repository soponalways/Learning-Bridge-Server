import { UserRole } from "./user";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                emailVerified: boolean;
                name: string;
                role: UserRole;
                status: string;
            }
        }
    }
}