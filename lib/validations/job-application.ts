import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
const sanitize = (value: string | undefined | null) => {
  if (!value) return value as any;
  // DOMPurify strips out malicious tags like <script>, <iframe>, etc.
  return DOMPurify.sanitize(value);
};
export const jobApplicationSchema = z.object({
  company: z.string().min(1, "Company name is required").max(100, "Company name is too long").transform(sanitize),
  position: z.string().min(1, "Position is required").max(100, "Position is too long").transform(sanitize),
  location: z.string().max(100).optional().or(z.literal("")).transform(sanitize),
  notes: z.string().max(2000).optional().or(z.literal("")).transform(sanitize),
  salary: z.string().max(50).optional().or(z.literal("")).transform(sanitize),
  //jobUrl: z.string().url("Please enter a valid URL (e.g., https://...)").optional().or(z.literal("")),
  // jobUrl: z.union([
  //   z.literal(""),
  //   z.string().trim().url("Please enter a valid URL (e.g., https://...)")
  // ]).optional(),
  jobUrl: z
  .string()
  .url("Invalid URL")
  .optional()
  .refine((url) => !url || url.startsWith("https://"), {
    message: "Only secure URLs allowed",
  }).transform(sanitize),
  columnId: z.string().min(1, "Column ID is required"),
  boardId: z.string().min(1, "Board ID is required"),
  tags: z.array(z.string()).optional(),
  description: z.string().max(3000).optional().or(z.literal("")).transform(sanitize),
});

// For updates, all fields become optional, plus we might need to update the order
export const updateJobApplicationSchema = jobApplicationSchema.partial().extend({
  order: z.number().optional(),
});