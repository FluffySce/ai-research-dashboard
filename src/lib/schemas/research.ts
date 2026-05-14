import { z } from "zod";

export const ResearchRequestSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(2, "Topic must be atleast 2 characters")
    .max(100, "Topic must not exceed 100 characters"),
});

export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;

export const GeneratedResearchSchema = z.object({
  summary: z
    .string()
    .min(50, "Summary too short")
    .max(3000, "Summary too long"),

  risks: z.array(z.string()).min(1, "Atleast 1 risk required"),

  opportunities: z.array(z.string()).min(1, "Atleast 1 oppurtunity required"),
});

export type GeneratedResearch = z.infer<typeof GeneratedResearchSchema>;

export const ResearchResultSchema = GeneratedResearchSchema.extend({
  topic: z.string(),
  id: z.uuid(),
  createdAt: z.iso.datetime(),
});

export type ResearchResult = z.infer<typeof ResearchResultSchema>;
