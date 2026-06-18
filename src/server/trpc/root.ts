import { router } from "./index";
import { mailRouter } from "./routers/mail";
import { calendarRouter } from "./routers/calendar";
import { aiRouter } from "./routers/ai";
import { dashboardRouter } from "./routers/dashboard";

export const appRouter = router({
  mail: mailRouter,
  calendar: calendarRouter,
  ai: aiRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
