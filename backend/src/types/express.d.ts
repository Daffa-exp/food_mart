export interface AuthenticatedUser {
  authId: string;
  email: string;
}

export interface AuthenticatedAdmin {
  id: string;
  role: "admin" | "super_admin";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      admin?: AuthenticatedAdmin;
    }
  }
}

export {};
