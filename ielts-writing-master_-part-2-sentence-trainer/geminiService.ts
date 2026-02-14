
import { GoogleGenAI, Type } from "@google/genai";
import { WritingTask, EssaySection, Feedback } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_CONTEXT = `
You are an IELTS Writing Task 2 expert. You have a database of 10 high-quality essays covering:
1. Education (Free university)
2. Technology (Social media & communication)
3. Environment (International vs individual effort)
4. Work (Remote work/Telecommuting)
5. Health (Fast food tax)
6. Society (Wealth gap/Inequality)
7. Crime (Prison vs Rehabilitation)
8. Tourism (Benefits vs Impacts)
9. Transport (Banning cars in city centers)
10. Children & Family (Screen time)

When generating tasks, pick one of these specific topics and create a Vietnamese sentence that matches the style and complexity of these essays.
`;

const FEEDBACK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    originalTranslation: { type: Type.STRING },
    band7Suggestion: { type: Type.STRING },
    band8PlusSuggestion: { type: Type.STRING },
    grammaticalAnalysis: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    vocabularyUpgrades: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          improvement: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["word", "improvement", "explanation"]
      }
    },
    cohesionAdvice: { type: Type.STRING }
  },
  required: ["band7Suggestion", "band8PlusSuggestion", "grammaticalAnalysis", "vocabularyUpgrades", "cohesionAdvice"]
};

export const generateTask = async (): Promise<WritingTask> => {
  const prompt = `${SYSTEM_CONTEXT}
  Generate a random IELTS Writing Task 2 sentence in Vietnamese based on one of the 10 topics. 
  Randomly pick an essay section: Introduction, Body Paragraph 1, Body Paragraph 2, or Conclusion.
  
  Return a JSON object: 
  - vietnamese: the sentence in Vietnamese.
  - topic: the essay topic name.
  - section: the section name.
  - context: what this sentence specifically does in the essay structure.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vietnamese: { type: Type.STRING },
          topic: { type: Type.STRING },
          section: { type: Type.STRING },
          context: { type: Type.STRING }
        },
        required: ["vietnamese", "topic", "section", "context"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return data as WritingTask;
};

export const evaluateTranslation = async (task: WritingTask, translation: string): Promise<Feedback> => {
  const prompt = `${SYSTEM_CONTEXT}
  Evaluate the user's translation for the sentence: "${task.vietnamese}"
  Topic: ${task.topic} (${task.section})
  User's input: "${translation}"
  
  Provide:
  1. Band 7.0 version (Academic, clear, complex).
  2. Band 8.5+ version (Sophisticated, precise lexical choices).
  3. Analysis of errors and vocabulary improvements.
  4. Cohesion advice specific to the ${task.section} of the essay.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: FEEDBACK_SCHEMA
    }
  });

  const data = JSON.parse(response.text);
  return {
    ...data,
    originalTranslation: translation
  };
};
