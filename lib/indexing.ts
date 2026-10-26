/** Search engines may index only a real production deployment, never staging, dev or the client demo. */
export const allowIndexing = () =>
  process.env.NODE_ENV === "production"
  && process.env.DEMO_MODE !== "true"
  && (process.env.APP_ENV ?? "production") === "production";
