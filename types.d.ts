import { AuthPayload } from "./dto/auth.dto";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
