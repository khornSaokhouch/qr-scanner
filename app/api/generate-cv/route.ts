// app/api/generate-cv/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "GEMINI_API_KEY is not configured in .env.local" },
            { status: 500 }
        );
    }

    try {
        const body = await req.json();
        const { prompt, currentCv, style } = body;

        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json(
                { error: "Please provide a prompt describing your profile or changes." },
                { status: 400 }
            );
        }

        const systemInstruction = `
You are an expert executive resume writer. 
Generate or refine a clean, professional CV in JSON format based on user input.

You MUST reply with ONLY valid JSON matching this schema:
{
  "fullName": "Full Name",
  "jobTitle": "Professional Title",
  "email": "email@example.com",
  "phone": "+1 234 567 890",
  "location": "City, Country",
  "website": "portfolio or linkedin",
  "summary": "Impactful 2-3 sentence professional summary",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6"],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "period": "2022 - Present",
      "description": "Key achievements and responsibilities using active verbs."
    }
  ],
  "education": [
    {
      "degree": "Degree and Major",
      "school": "University or Institution",
      "year": "2018 - 2022"
    }
  ]
}
`;

        const userContent = currentCv
            ? `Current CV Data:\n${JSON.stringify(currentCv)}\n\nUser instructions to update/refine:\n${prompt}\nStyle: ${style || "Modern"}`
            : `Create a professional CV from this information:\n${prompt}\nStyle: ${style || "Modern"}`;

        // Uses the recommended gemini-3.6-flash model
        const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                { text: systemInstruction },
                                { text: userContent },
                            ],
                        },
                    ],
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.7,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            const errMessage = errData?.error?.message || "Google AI Studio failed to generate CV.";
            console.error("Gemini API Error:", errData);
            return NextResponse.json(
                { error: errMessage },
                { status: response.status }
            );
        }

        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidateText) {
            throw new Error("No response from AI model.");
        }

        const parsedCv = JSON.parse(candidateText);
        return NextResponse.json({ success: true, cv: parsedCv });
    } catch (err: any) {
        console.error("CV generation error:", err);
        return NextResponse.json(
            { error: err.message || "Failed to process AI CV request." },
            { status: 500 }
        );
    }
}