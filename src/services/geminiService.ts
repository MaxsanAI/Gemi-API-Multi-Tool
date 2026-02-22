import { GoogleGenAI } from '@google/genai';

async function editImage(base64Image: string, prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = 'gemini-2.5-flash-image';
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: 'image/png',
    },
  };
  const textPart = {
    text: prompt,
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, textPart] },
  });

  if (response.candidates && response.candidates[0].content.parts[0].inlineData) {
    return response.candidates[0].content.parts[0].inlineData.data;
  }

  throw new Error('No image found in response');
}

async function animateImage(base64Image: string, mimeType: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    image: {
      imageBytes: base64Image,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error('Video generation failed');
  }

  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': process.env.GEMINI_API_KEY!,
    },
  });

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export interface GroundingSource {
  uri: string;
  title: string;
}

async function searchWithGoogle(query: string): Promise<{ text: string; sources: GroundingSource[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text ?? '';
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const sources: GroundingSource[] = chunks
    ? chunks.map((chunk: any) => ({ uri: chunk.web.uri, title: chunk.web.title }))
    : [];

  return { text, sources };
}

async function searchWithMaps(query: string, location: { latitude: number; longitude: number } | null): Promise<{ text: string; sources: GroundingSource[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const toolConfig: any = {};
  if (location) {
    toolConfig.retrievalConfig = {
      latLng: {
        latitude: location.latitude,
        longitude: location.longitude,
      }
    }
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: toolConfig,
    },
  });

  const text = response.text ?? '';
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const sources: GroundingSource[] = chunks
    ? chunks.map((chunk: any) => ({ uri: chunk.maps.uri, title: chunk.maps.title }))
    : [];

  return { text, sources };
}

async function generateImagePro(prompt: string, imageSize: '1K' | '2K' | '4K', aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        imageSize: imageSize,
        aspectRatio: aspectRatio,
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error('No image found in response');
}

async function generalChat(prompt: string, model: 'gemini-3.1-pro-preview' | 'gemini-3-flash-preview'): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  return response.text ?? 'Sorry, I could not process that.';
}

async function generateVideoFromPrompt(prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error('Video generation failed');
  }

  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': process.env.GEMINI_API_KEY!,
    },
  });

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

async function analyzeImage(base64Image: string, mimeType: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = 'gemini-3.1-pro-preview';
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };
  const textPart = {
    text: 'Describe this image in detail.',
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, textPart] },
  });

  return response.text ?? 'Sorry, I could not analyze that image.';
}

async function fastChat(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: prompt,
  });
  return response.text ?? 'Sorry, I could not process that.';
}

async function analyzeVideo(video: File): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = 'gemini-3.1-pro-preview';

  const videoPart = {
    inlineData: {
      data: await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(video);
      }),
      mimeType: video.type,
    },
  };

  const textPart = {
    text: 'Describe this video in detail.',
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [videoPart, textPart] },
  });

  return response.text ?? 'Sorry, I could not analyze that video.';
}

async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = 'gemini-3-flash-preview';

  const audioPart = {
    inlineData: {
      data: await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      }),
      mimeType: audioBlob.type,
    },
  };

  const textPart = {
    text: 'Transcribe this audio.',
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [audioPart, textPart] },
  });

  return response.text ?? 'Sorry, I could not transcribe that audio.';
}

import { ThinkingLevel } from '@google/genai';

async function complexChat(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
    },
  });
  return response.text ?? 'Sorry, I could not process that.';
}

import { Modality } from '@google/genai';

async function generateSpeech(text: string): Promise<Uint8Array> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const audioData = atob(base64Audio);
    const audioBuffer = new Uint8Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      audioBuffer[i] = audioData.charCodeAt(i);
    }
    return audioBuffer;
  }

  throw new Error('No audio found in response');
}

import { FunctionDeclaration, Type } from '@google/genai';
import mexp from 'math-expression-evaluator';

const calculatorFunctionDeclaration: FunctionDeclaration = {
  name: 'calculator',
  parameters: {
    type: Type.OBJECT,
    description: 'Calculates a mathematical expression.',
    properties: {
      expression: {
        type: Type.STRING,
        description: 'The mathematical expression to evaluate.',
      },
    },
    required: ['expression'],
  },
};

async function runCalculator(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = 'gemini-3.1-pro-preview';

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ functionDeclarations: [calculatorFunctionDeclaration] }],
    },
  });

  const functionCalls = response.functionCalls;
  if (functionCalls) {
    for (const call of functionCalls) {
      if (call.name === 'calculator') {
        try {
          const result = mexp.eval(call.args.expression);
          // Send the result back to the model
          const response2 = await ai.models.generateContent({
            model,
            contents: {
              parts: [
                {
                  functionResponse: {
                    name: 'calculator',
                    response: { result: result.toString() },
                  },
                },
              ],
            },
            config: {
              tools: [{ functionDeclarations: [calculatorFunctionDeclaration] }],
            },
          });
          return response2.text ?? 'Calculation done, but could not formulate a response.';
        } catch (e) {
          return 'Could not evaluate the expression.';
        }
      }
    }
  }

  return response.text ?? 'I did not understand the request.';
}

export const geminiService = {
  editImage,
  animateImage,
  searchWithGoogle,
  searchWithMaps,
  generateImagePro,
  generalChat,
  generateVideoFromPrompt,
  analyzeImage,
  fastChat,
  analyzeVideo,
  transcribeAudio,
  complexChat,
  generateSpeech,
  runCalculator,
};
