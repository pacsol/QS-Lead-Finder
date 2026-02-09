
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Opportunity, AnalysisResult } from "../types";

export const findOpportunities = async (location: string, sector: string): Promise<{ text: string, sources: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Search for currently active construction opportunities, tender notices, and planning applications for Quantity Surveyors in ${location}, UK specifically for the ${sector} sector. Focus on projects looking for cost management, bill of quantities, or residential/commercial development.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text || "No results found.",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const parseOpportunities = async (rawSearchText: string): Promise<Opportunity[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `From the following construction market report text, extract a list of at least 3-5 specific project opportunities.
    For each project, identify:
    - title (short, professional)
    - location (specific UK town/city)
    - description (brief summary of what is being built)
    - stage (must be one of: "Planning", "Tender", "Construction")
    - estimatedValue (e.g. "£2M", "Unknown")

    TEXT:
    ${rawSearchText}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            location: { type: Type.STRING },
            description: { type: Type.STRING },
            stage: { type: Type.STRING, enum: ["Planning", "Tender", "Construction"] },
            estimatedValue: { type: Type.STRING },
          },
          required: ["title", "location", "description", "stage", "estimatedValue"],
        },
      },
    },
  });

  try {
    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, index: number) => ({
      ...item,
      id: `real-${Date.now()}-${index}`,
      source: "Gemini Search",
      timestamp: new Date().toISOString()
    }));
  } catch (e) {
    console.error("Failed to parse opportunities JSON", e);
    return [];
  }
};

export const findLocalFirms = async (location: string): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Find main contractors and architecture firms near ${location}, UK that a quantity surveyor might want to partner with.`,
    config: {
      tools: [{ googleMaps: {} }],
    },
  });

  return response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
};

export const analyzeLead = async (opportunity: Opportunity): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `As a senior quantity surveyor, analyze this project lead:
    Title: ${opportunity.title}
    Location: ${opportunity.location}
    Description: ${opportunity.description}
    Stage: ${opportunity.stage}

    Please provide a structured analysis in JSON format including:
    1. Feasibility (high-level)
    2. Risk Assessment (budget, complexity, local planning)
    3. Competitor Insights
    4. Recommended Action for a self-employed QS.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feasibility: { type: Type.STRING },
          riskAssessment: { type: Type.STRING },
          competitorInsights: { type: Type.STRING },
          recommendedAction: { type: Type.STRING },
        },
        required: ["feasibility", "riskAssessment", "competitorInsights", "recommendedAction"],
      }
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    throw new Error("Failed to parse analysis response");
  }
};
