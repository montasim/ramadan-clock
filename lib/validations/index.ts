import { z } from "zod/v4";

export const timeEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  sehri: z.string().regex(/^\d{2}:\d{2}$/, "Sehri time must be in HH:mm format"),
  iftar: z.string().regex(/^\d{2}:\d{2}$/, "Iftar time must be in HH:mm format"),
  location: z.string().optional().nullable(),
});

export const timeEntryArraySchema = z.array(timeEntrySchema);

export const uploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 1024 * 1024,
    "File size must be less than 1MB"
  ),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const locationParamsSchema = z.object({
  city: z.string().min(1, "City name is required"),
});
