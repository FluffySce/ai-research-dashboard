import { generateText, Output, NoObjectGeneratedError } from "ai";
import {
  GeneratedResearchSchema,
  type GeneratedResearch,
} from "./schemas/research";
import { google } from "@ai-sdk/google";

//fail fast check
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Gemini API key is not set/valid");
}

const RESEARCH_SYSTEM_PROMPT = [
  "You are an expert research assistant.",
  "Generate practical research about the provided topic. Return:",
  "- A detailed summary",
  "- Key risks (as specific, actionable points)",
  "- Key opportunities (as specific, actionable points)",
  "Keep the response factual and structured.",
].join("\n");

export async function generateResearch(
  topic: string,
): Promise<GeneratedResearch> {
  try {
    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: RESEARCH_SYSTEM_PROMPT,
      prompt: `Research topic: ${topic}`,
      output: Output.object({
        schema: GeneratedResearchSchema,
      }),
    });
    if (!result.output) {
      throw new Error("AI returned no output");
    }

    return result.output;
  } catch (error) {
    //AI didn't match the schema
    if (error instanceof NoObjectGeneratedError) {
      console.error("Failed to generate valid output structure:", {
        cause: error,
      });
      throw new Error("AI returned an invalid response structure", {
        cause: error,
      });
    }
    // Generic errors
    console.error("Research generation failed:", error);

    throw new Error("Failed to generate research", { cause: error });
  }
}
