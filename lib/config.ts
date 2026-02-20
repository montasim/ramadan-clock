import { z } from "zod";

// Configuration schema for validation
const configSchema = z.object({
  // Database
  databaseUrl: z.string().url(),

  // NextAuth
  nextAuthSecret: z.string().min(1),
  nextAuthUrl: z.string().url(),

  // Admin
  adminEmail: z.string().email(),
  adminPassword: z.string().min(1),

  // Project Info
  projectRepoUrl: z.string().url(),

  // Developer Info
  developerName: z.string(),
  developerBio: z.string(),
  developerGithub: z.string().url(),
  developerLinkedin: z.string().url(),
  developerEmail: z.string().email(),

  // Hadith API (optional)
  hadithApiKey: z.string().optional(),
});

// Export validated configuration
export const config = configSchema.parse({
  databaseUrl: process.env.DATABASE_URL || "postgresql://localhost:5432/ramadan-clock",
  nextAuthSecret: process.env.NEXTAUTH_SECRET || "default-secret-change-in-production",
  nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  adminEmail: process.env.ADMIN_EMAIL || "admin@example.com",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  projectRepoUrl: process.env.PROJECT_REPO_URL || "https://github.com/your-username/ramadan-clock",
  developerName: process.env.DEVELOPER_NAME || "Developer",
  developerBio: process.env.DEVELOPER_BIO || "Full Stack Developer",
  developerGithub: process.env.DEVELOPER_GITHUB || "https://github.com/your-username",
  developerLinkedin: process.env.DEVELOPER_LINKEDIN || "https://linkedin.com/in/your-username",
  developerEmail: process.env.DEVELOPER_EMAIL || "developer@example.com",
  hadithApiKey: process.env.HADITH_API_KEY,
});
