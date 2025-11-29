import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const extractDocumentDetails = async (fileBase64: string, mimeType: string) => {
  const client = getClient();
  if (!client) throw new Error("API Key not found");

  const prompt = `
    Analyze this legal/banking document. Extract the following key details:
    - Document Type (e.g., Sale Deed, Notice, Valuation Report)
    - Date of Document
    - Key Parties Involved (Names)
    - Property Address/Description (if applicable)
    - Financial Amounts (if applicable)
    - Any Encumbrances or Legal Flags mentioned.

    Return the data in a structured JSON format.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentType: { type: Type.STRING },
            date: { type: Type.STRING },
            parties: { type: Type.ARRAY, items: { type: Type.STRING } },
            propertyDescription: { type: Type.STRING },
            amounts: { type: Type.ARRAY, items: { type: Type.STRING } },
            flags: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceScore: { type: Type.NUMBER, description: "Confidence score between 0 and 1" }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Extraction error:", error);
    throw error;
  }
};

export const predictRecoveryValue = async (assetDescription: string, currentMarketValue: number, location: string) => {
  const client = getClient();
  if (!client) throw new Error("API Key not found");

  const prompt = `
    Act as a bank recovery valuation expert.
    Asset: ${assetDescription}
    Location: ${location}
    Current Book Value: ${currentMarketValue}

    Predict the realistic recovery value (auction sale price) for this asset considering distressed sale conditions.
    Estimate the probability of sale within 90 days.
    Provide a brief reasoning.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedRecoveryValue: { type: Type.NUMBER },
            saleProbability90Days: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            suggestedReservePrice: { type: Type.NUMBER }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Prediction error:", error);
    throw error;
  }
};

export const generateLegalNotice = async (borrowerName: string, amount: number, assetDetails: string, noticeType: string) => {
  const client = getClient();
  if (!client) throw new Error("API Key not found");

  const prompt = `
    Draft a formal legal notice of type "${noticeType}" for a bank asset recovery case.
    Borrower: ${borrowerName}
    Outstanding Amount: ${amount}
    Asset: ${assetDetails}

    The tone should be strictly legal, formal, and compliant with banking regulations (SARFAESI Act context if applicable).
    Return the content as a plain string formatted with Markdown.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Generation error:", error);
    throw error;
  }
};
