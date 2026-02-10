import { GoogleGenAI, Type } from "@google/genai";
import { Opportunity, EmailSequence, Proposal, OnePager } from "../types";

export const generateEmailSequence = async (opp: Opportunity): Promise<EmailSequence> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `You are a business development expert for a UK-based quantity surveying consultancy. Generate a 3-step cold email outreach sequence for this construction opportunity:

Title: ${opp.title}
Location: ${opp.location}
Description: ${opp.description}
Stage: ${opp.stage}
Estimated Value: ${opp.estimatedValue || 'Unknown'}

Each email should be professional, concise, and tailored to winning QS work on this project. Include compelling subject lines and clear calls to action.`;

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
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
            sendDelay: { type: Type.STRING },
            callToAction: { type: Type.STRING },
          },
          required: ["subject", "body", "sendDelay", "callToAction"],
        },
      },
    },
  });

  try {
    const steps = JSON.parse(response.text || "[]");
    return { steps, opportunityId: opp.id };
  } catch (e) {
    throw new Error("Failed to parse email sequence response");
  }
};

export const generateProposal = async (opp: Opportunity): Promise<Proposal> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `You are a senior quantity surveyor preparing a professional fee proposal for:

Title: ${opp.title}
Location: ${opp.location}
Description: ${opp.description}
Stage: ${opp.stage}
Estimated Value: ${opp.estimatedValue || 'Unknown'}

Generate a comprehensive proposal with all sections. Be specific to this project, reference UK construction standards (NRM, JCT, NEC), and position the QS consultancy as experienced and capable.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          scopeOfServices: { type: Type.STRING },
          methodology: { type: Type.STRING },
          timeline: { type: Type.STRING },
          feeStructure: { type: Type.STRING },
          qualifications: { type: Type.STRING },
        },
        required: ["executiveSummary", "scopeOfServices", "methodology", "timeline", "feeStructure", "qualifications"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    throw new Error("Failed to parse proposal response");
  }
};

export const generateOnePager = async (opp: Opportunity): Promise<OnePager> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Create a punchy one-page marketing document for a quantity surveying consultancy pitching for:

Title: ${opp.title}
Location: ${opp.location}
Description: ${opp.description}
Stage: ${opp.stage}
Estimated Value: ${opp.estimatedValue || 'Unknown'}

The one-pager should be compelling, highlight key QS services relevant to this project, and include differentiators that set this consultancy apart.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          servicesList: { type: Type.STRING },
          differentiators: { type: Type.STRING },
          recentProjects: { type: Type.STRING },
          contactCTA: { type: Type.STRING },
        },
        required: ["headline", "servicesList", "differentiators", "recentProjects", "contactCTA"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    throw new Error("Failed to parse one-pager response");
  }
};
