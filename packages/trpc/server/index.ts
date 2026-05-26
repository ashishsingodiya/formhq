import { router } from "./trpc";

import { authRouter } from "./routes/auth/route";
import { formRouter } from "./routes/form/route";
import { healthRouter } from "./routes/health/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  form: formRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
