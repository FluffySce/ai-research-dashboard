import { z } from "zod";
import {
  ResearchRequestSchema,
  type ResearchResult,
} from "@/lib/schemas/research";
import { generateResearch } from "@/lib/ai";

export async function POST(req: Request) {
  //read req body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  //validating body
  const validationResult = ResearchRequestSchema.safeParse(body);
  //invalid input
  if (!validationResult.success) {
    return Response.json(
      {
        error: "Validation failed",
        details: z.flattenError(validationResult.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  //valid topic
  const topic = validationResult.data.topic;
  //sending that topic to ai layer
  try {
    //call ai service layer
    const aiResult = await generateResearch(topic);
    //final response assembly
    const researchResult: ResearchResult = {
      ...aiResult,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      topic,
    };
    return Response.json(researchResult, {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    // Misconfiguration errors are our fault (500), not external service (502)
    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return Response.json(
        { error: "Server misconfiguration" },
        { status: 500 },
      );
    }
    return Response.json(
      { error: "Failed to generate AI research" },
      { status: 502 },
    );
  }
}
