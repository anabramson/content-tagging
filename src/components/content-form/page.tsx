'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, Network, Save, BrainCircuit } from 'lucide-react';
import ContentTaggingTable from './ContentTaggingTable';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// Type definitions
interface CategoryDefinition {
  options: string[];
  description: string;
}

interface FormData {
  title: string;
  description: string;
  distributionChannel: string;
  accessLevel: string;
  contentType: string;
  writtenFormat: string;
  fileType: string;
  visualFormat: string;
  interactiveFormat: string;
  tags: string[];
}

interface Recommendation {
  value: string;
  confidence: number;
  similar: number;
}

type HistoricalContent = FormData;


interface PatternInsights {
  similarContent: Array<{
    content: HistoricalContent;
    similarity: number;
  }>;
  topMatches: number;
}

// Constants
const categoryDefinitions: Record<string, CategoryDefinition> = {
  distributionChannel: {
    options: ['Social Media', 'Newsletter', 'Website', 'Premium Content'],
    description: 'Where the content will be primarily distributed'
  },
  accessLevel: {
    options: ['Public', 'Members Only', 'Premium'],
    description: 'Who can access this content'
  },
  contentType: {
    options: ['LONG FORM', 'MEDIUM FORM', 'QUICK TAKE', 'VISUAL/INTERACTIVE'],
    description: 'The primary format of the content'
  },
  writtenFormat: {
    options: ['Feature Article', 'Standard Article', 'Brief Article', 'Technical Framework'],
    description: 'Specific written content structure'
  },
  fileType: {
    options: ['PDF', 'Excel', 'Web'],
    description: 'Final delivery format'
  },
  visualFormat: {
    options: ['Image Analysis', 'Quote Card', 'Carousel', 'Infographic', 'Video', 'Reel/Story'],
    description: 'Visual elements included'
  },
  interactiveFormat: {
    options: ['Poll', 'Thread', 'Template', 'Framework', 'Dashboard', 'Checklist'],
    description: 'Interactive elements included'
  }
};

const historicalContent: HistoricalContent[] = [
  {
    title: "Advanced AI Implementation Guide",
    description: "Comprehensive guide for implementing AI systems with focus on human-centered design",
    distributionChannel: "Premium Content",
    accessLevel: "Premium",
    contentType: "LONG FORM",
    writtenFormat: "Technical Framework",
    fileType: "PDF",
    visualFormat: "Infographic",
    interactiveFormat: "Framework",
    tags: ["#HumanFirstDesign", "#AIFoundations", "#ResponsibleScale"]
  },
  {
    title: "Quick Social Media Updates on AI News",
    description: "Daily updates on AI developments for social sharing",
    distributionChannel: "Social Media",
    accessLevel: "Public",
    contentType: "QUICK TAKE",
    writtenFormat: "Brief Article",
    fileType: "Web",
    visualFormat: "Quote Card",
    interactiveFormat: "Thread",
    tags: ["#AINews", "#AIBreakthroughs"]
  }
];

const initialFormData: FormData = {
  title: '',
  description: '',
  distributionChannel: '',
  accessLevel: '',
  contentType: '',
  writtenFormat: '',
  fileType: '',
  visualFormat: '',
  interactiveFormat: '',
  tags: []
};

const ContentForm = () => {
  // Memoized values
  const memoizedCategoryDefinitions = useMemo(() => categoryDefinitions, []);

  // State management
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [recommendations, setRecommendations] = useState<Record<string, Recommendation[]>>({});
  const [patternInsights, setPatternInsights] = useState<PatternInsights | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: string; message: string; } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Text analysis functions
  const analyzeText = useCallback((text: string) => {
    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 2);
    return words.reduce((acc: Record<string, number>, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
  }, []);

  const calculateSimilarity = useCallback((text1: string, text2: string) => {
    const freq1 = analyzeText(text1);
    const freq2 = analyzeText(text2);
    
    const words = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    words.forEach(word => {
      const f1 = freq1[word] || 0;
      const f2 = freq2[word] || 0;
      dotProduct += f1 * f2;
      mag1 += f1 * f1;
      mag2 += f2 * f2;
    });

    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2) || 1);
  }, [analyzeText]);

  const generateRecommendations = useCallback((title: string, description: string) => {
    const combinedText = `${title} ${description}`.trim();
    if (!combinedText) return { recommendations: {}, similarContent: [] };

    try {
      const similarContent = historicalContent
        .map(content => ({
          content,
          similarity: calculateSimilarity(
            combinedText.toLowerCase(),
            `${content.title} ${content.description}`.toLowerCase()
          )
        }))
        .filter(({ similarity }) => similarity > 0.1)
        .sort((a, b) => b.similarity - a.similarity);

      const recommendations: Record<string, Recommendation[]> = {};
      
      Object.keys(memoizedCategoryDefinitions).forEach(category => {
        const categoryScores: Record<string, { confidence: number, count: number }> = {};
        
        memoizedCategoryDefinitions[category].options.forEach(option => {
          categoryScores[option] = { confidence: 0, count: 0 };
        });

        similarContent.forEach(({ content, similarity }) => {
          const value = content[category as keyof typeof content];
          if (typeof value === 'string' && value in categoryScores) {
            categoryScores[value].confidence += similarity * 100;
            categoryScores[value].count += 1;
          }
        });

        recommendations[category] = Object.entries(categoryScores)
          .map(([value, { confidence, count }]) => ({
            value,
            confidence: Math.round(confidence),
            similar: count
          }))
          .filter(rec => rec.confidence > 0)
          .sort((a, b) => b.confidence - a.confidence);
      });

      return { recommendations, similarContent };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }, [calculateSimilarity, memoizedCategoryDefinitions]);

  // Update recommendations when title or description changes
  useEffect(() => {
    const { title, description } = formData;
    if (!title || !description) return;
  
    try {
      const results = generateRecommendations(title, description);
      setRecommendations(results.recommendations);
  
      // Update form fields based on recommendations
      const updatedFields: Partial<FormData> = {};
      Object.entries(results.recommendations).forEach(([category, recs]) => {
        if (recs && recs.length > 0 && recs[0].confidence > 30) {
          const key = category as keyof FormData;
          if (key !== 'tags' && formData[key] !== recs[0].value) {
            updatedFields[key] = recs[0].value;
          }
        }
      });
  
      if (Object.keys(updatedFields).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...updatedFields
        }));
      }
  
      // Update pattern insights
      if (results.similarContent.length > 0) {
        setPatternInsights({
          similarContent: results.similarContent.slice(0, 3),
          topMatches: results.similarContent.length,
        });
      }
    } catch (error) {
      console.error('Error updating recommendations:', error);
      setError('An error occurred while updating recommendations.');
    }
  }, [formData, generateRecommendations]); // Added formData to dependencies

  // Handle form input changes
  const handleInputChange = useCallback((
    name: keyof FormData,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Form submission handler
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus({ type: 'success', message: 'Content saved successfully!' });
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveStatus({ type: 'error', message: 'Failed to save content. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-6">
      <div className="bg-white rounded-lg shadow-lg border p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold">Content Categorizer</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <BrainCircuit className="h-6 w-6 text-blue-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p>AI-powered content categorization</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter content title"
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter content description"
              className="h-32 text-base"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(memoizedCategoryDefinitions).map(([category, { options, description }]) => (
              <div key={category} className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="text-base cursor-help">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Select
                  value={formData[category as keyof FormData] as string}
                  onValueChange={(value: string) => handleInputChange(category as keyof FormData, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${category}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map(value => {
                      const recommendation = recommendations[category]?.find(r => r.value === value);
                      return (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{value}</span>
                            {recommendation && recommendation.confidence > 40 && (
                              <Badge variant="secondary" className="ml-2">
                                {recommendation.confidence}%
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {patternInsights?.similarContent && patternInsights.similarContent.length > 0 && (
            <div className="mt-8 p-6 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-3 mb-4">
                <BrainCircuit className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-medium">Content Pattern Insights</h3>
              </div>
              <div className="space-y-4">
                {patternInsights.similarContent.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="font-medium text-lg">{item.content.title}</div>
                    <div className="text-gray-600 mt-1">{item.content.description}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary">
                        {Math.round(item.similarity * 100)}% Similar
                      </Badge>
                      {item.content.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
{saveStatus && (
            <Alert variant={saveStatus.type === 'success' ? 'default' : 'destructive'}>
              <AlertTitle>
                {saveStatus.type === 'success' ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription>
                {saveStatus.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Add ContentTaggingTable here, before the buttons */}
          {formData.title && (
            <ContentTaggingTable formData={formData} />
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                try {
                  console.log('Current recommendations:', recommendations);
                  console.log('Pattern insights:', patternInsights);
                } catch (error) {
                  console.error('Error logging insights:', error);
                  setError('Failed to view insights. Please try again.');
                }
              }}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Insights
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || !formData.title || !formData.description}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <Network className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Content
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentForm;