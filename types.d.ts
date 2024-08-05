import { AuthPayload } from "./src/dto/auth.dto";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
