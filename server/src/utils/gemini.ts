import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const askGemini = async (context: string, prompt: string) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
        { text: context + "\n\n" + prompt }
    ]);

    return result.response.text();
};
