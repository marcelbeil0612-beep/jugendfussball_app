import "server-only";

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL fehlt"),
  AUTH_EMAIL_FROM: z.string().min(1, "AUTH_EMAIL_FROM fehlt"),
  AUTH_EMAIL_SERVER: z.string().min(1, "AUTH_EMAIL_SERVER fehlt"),
  APP_URL: z.string().url("APP_URL muss eine URL sein"),
});

export const env = envSchema.parse(process.env);
