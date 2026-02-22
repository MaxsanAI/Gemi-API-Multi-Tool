import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Image, 
  Sparkles, 
  Video, 
  Search, 
  Map, 
  Crop, 
  Scan, 
  Bolt, 
  Mic, 
  BrainCircuit, 
  AudioLines,
  Calculator
} from 'lucide-react';
import ImageEditor from './components/ImageEditor';
import { Feature } from './types';

import VoiceChat from './components/VoiceChat';

import AnimateImage from './components/AnimateImage';

import SearchGrounding from './components/SearchGrounding';

import MapsGrounding from './components/MapsGrounding';

import ImageGeneratorPro from './components/ImageGeneratorPro';

import GeneralIntelligence from './components/GeneralIntelligence';

import VideoGenerator from './components/VideoGenerator';

import ImageAnalyzer from './components/ImageAnalyzer';

import FastChat from './components/FastChat';

import VideoAnalyzer from './components/VideoAnalyzer';

import AudioTranscriber from './components/AudioTranscriber';

import ComplexChat from './components/ComplexChat';

import TextToSpeech from './components/TextToSpeech';

import FunctionCalling from './components/FunctionCalling';
import WeatherForecast from './components/WeatherForecast';
import { CloudSun } from 'lucide-react';

const features: Feature[] = [
  {
    title: "Weather Forecast",
    icon: <CloudSun size={24} />,
    description: "Get a 7-day weather forecast for your current location.",
    component: WeatherForecast,
  },
  { 
    title: "Nano banana powered app", 
    icon: <Image size={24} />,
    description: "Use text prompts to edit images using Gemini 2.5 Flash Image.",
    component: ImageEditor,
  },
  {
    title: "Create conversational voice apps",
    icon: <AudioLines size={24} />,
    description: "Have a real-time conversation with the Live API.",
    component: VoiceChat,
  },
  {
    title: "Animate images with Veo",
    icon: <Video size={24} />,
    description: "Upload a photo and generate a video using Veo.",
    component: AnimateImage,
  },
  {
    title: "Use Google Search data",
    icon: <Search size={24} />,
    description: "Get up-to-date and accurate information with Search Grounding.",
    component: SearchGrounding,
  },
  {
    title: "Use Google Maps data",
    icon: <Map size={24} />,
    description: "Get up-to-date and accurate information with Maps Grounding.",
    component: MapsGrounding,
  },
  {
    title: "Generate images with Nano Banana Pro",
    icon: <Image size={24} />,
    description: "Generate images and specify the image size (1K, 2K, and 4K) and aspect ratio.",
    component: ImageGeneratorPro,
  },
  {
    title: "Control image aspect ratios",
    icon: <Crop size={24} />,
    description: "Generate images and specify the aspect ratio.",
    component: ImageGeneratorPro,
  },
  {
    title: "Gemini intelligence in your app",
    icon: <Sparkles size={24} />,
    description: "Analyze content, make edits, and more with Gemini Pro and Flash.",
    component: GeneralIntelligence,
  },
  {
    title: "Prompt based video generation",
    icon: <Video size={24} />,
    description: "Generate a video using Veo with a text prompt.",
    component: VideoGenerator,
  },
  {
    title: "Analyze images",
    icon: <Scan size={24} />,
    description: "Upload a photo and analyze it using Gemini.",
    component: ImageAnalyzer,
  },
  {
    title: "Fast AI responses",
    icon: <Bolt size={24} />,
    description: "Get low-latency responses with gemini-2.5-flash-lite.",
    component: FastChat,
  },
  {
    title: "Video understanding",
    icon: <Video size={24} />,
    description: "Analyze videos for key information with Gemini Pro.",
    component: VideoAnalyzer,
  },
  {
    title: "Transcribe audio",
    icon: <Mic size={24} />,
    description: "Transcribe audio from the microphone with Gemini.",
    component: AudioTranscriber,
  },
  {
    title: "Think more when needed",
    icon: <BrainCircuit size={24} />,
    description: "Handle complex queries with thinking mode.",
    component: ComplexChat,
  },
  {
    title: "Generate speech",
    icon: <AudioLines size={24} />,
    description: "Transform text into speech with TTS.",
    component: TextToSpeech,
  },
  {
    title: "Function Calling",
    icon: <Calculator size={24} />,
    description: "Use tools like a calculator to answer questions.",
    component: FunctionCalling,
  },
];

export default function App() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  if (selectedFeature) {
    const FeatureComponent = selectedFeature.component;
    return (
      <div className="min-h-screen bg-background font-sans antialiased">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Button variant="ghost" onClick={() => setSelectedFeature(null)}>
              &larr; Back
            </Button>
            <div className="mr-4 flex md:flex">
              <a className="ml-6 flex items-center space-x-2" href="/">
                <Sparkles className="h-6 w-6" />
                <span className="font-bold sm:inline-block">{selectedFeature.title}</span>
              </a>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="container py-12">
            <FeatureComponent />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <Sparkles className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">Gemi API Multi-Tool</span>
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-12">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Gemi API Multi-Tool
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Explore the power of the Gemini API with this all-in-one multi-tool.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} onClick={() => setSelectedFeature(feature)} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{feature.title}</CardTitle>
                  {feature.icon}
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
