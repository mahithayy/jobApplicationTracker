import { z } from "zod";
//import DOMPurify from "isomorphic-dompurify";
// const sanitize = (value: string | undefined) => {
//   if (!value) return value;
//   // DOMPurify strips out malicious tags like <script>, <iframe>, etc.
//   return DOMPurify.sanitize(value);
// };
export const jobApplicationSchema = z.object({
  company: z.string().min(1, "Company name is required").max(100, "Company name is too long"),
  position: z.string().min(1, "Position is required").max(100, "Position is too long"),
  location: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  salary: z.string().max(50).optional().or(z.literal("")),
  //jobUrl: z.string().url("Please enter a valid URL (e.g., https://...)").optional().or(z.literal("")),
  // jobUrl: z.union([
  //   z.literal(""),
  //   z.string().trim().url("Please enter a valid URL (e.g., https://...)")
  // ]).optional(),
 jobUrl: z
    .union([
      z.literal(""), // Accepts empty string if user leaves it blank
      z.string()
        .url("Please enter a valid URL (e.g., https://example.com)")
        .refine((url) => url.startsWith("https://"), {
          message: "Only secure HTTPS URLs are allowed",
        })
    ])
    .optional()
    ,
  columnId: z.string().min(1, "Column ID is required"),
  boardId: z.string().min(1, "Board ID is required"),
  tags: z.array(z.string()).optional(),
  description: z.string().max(3000).optional().or(z.literal("")),
});

// For updates, all fields become optional, plus we might need to update the order
export const updateJobApplicationSchema = jobApplicationSchema
  .omit({ boardId: true })
  .partial()
  .extend({
    order: z.number().optional(),
  });
