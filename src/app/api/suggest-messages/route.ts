import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "edge";

export async function POST() {
  try {
    const prompt = `
Generate exactly 3 open-ended anonymous social questions.

Rules:
- Separate each question using ||
- No numbering
- No quotes
- Friendly tone
- Avoid sensitive topics
`;

    const result = streamText({
      model: openai("gpt-4.1-mini"),
      prompt,
      temperature: 0.8,
      maxOutputTokens: 120,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error("Suggest message error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to generate message",
      },
      {
        status: 500,
      }
    );
  }
}