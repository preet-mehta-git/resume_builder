import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIAnalyzer {
  static genAI = null;

  static initialize() {
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBYr2lN1BBqOAh0jTg_grt_wlm3yo129XY";
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured! Please set the API key in environment variables.');
      this.genAI = null;
      return;
    }
    console.log('Initializing Gemini AI with API key...');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Analyze resume text using Gemini AI
   */
  static async analyzeResume(resumeText) {
    if (!this.genAI) {
      this.initialize();
    }

    // If still no genAI, throw error instead of fallback
    if (!this.genAI) {
      throw new Error('Gemini API not configured. Please check your API key.');
    }

    try {
      console.log('Starting Gemini AI 2.5 Flash analysis...');
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = this.buildAnalysisPrompt(resumeText);
      console.log('Sending prompt to Gemini API...');

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Received response from Gemini API, parsing...');
      return this.parseAIResponse(text, resumeText);
    } catch (error) {
      console.error('AI analysis error:', error);
      if (error.message.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key. Please check your configuration.');
      }
      if (error.message.includes('QUOTA_EXCEEDED')) {
        throw new Error('Gemini API quota exceeded. Please try again later.');
      }
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Build comprehensive analysis prompt for Gemini
   */
  static buildAnalysisPrompt(resumeText) {
    return `
Please analyze this resume comprehensively and provide a structured assessment. Respond with a JSON object containing the following fields:

{
  "score": number (0-100),
  "feedback": {
    "formatting": "assessment of formatting and structure",
    "skills": "assessment of skills presentation and relevance",
    "grammar": "grammar and language quality assessment",
    "impact": "assessment of impact statements and achievements",
    "atsCompatibility": "ATS compatibility percentage and assessment"
  },
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "strengths": ["strength 1", "strength 2", ...]
}

Analysis criteria:
1. **Overall Score (0-100)**: Based on formatting, content quality, ATS compatibility, keyword usage, and professional presentation
2. **Formatting**: Structure, consistency, readability, professional appearance
3. **Skills**: Relevance, specificity, technical vs soft skills balance
4. **Grammar**: Language quality, professional tone, clarity
5. **Impact**: Use of metrics, action verbs, quantified achievements
6. **ATS Compatibility**: Format compatibility with Applicant Tracking Systems
7. **Recommendations**: Specific, actionable improvements (max 6)
8. **Missing Keywords**: Industry-relevant keywords that could improve visibility (max 8)
9. **Strengths**: What the resume does well (max 5)

Resume text to analyze:
${resumeText}

Respond only with the JSON object, no additional text.
    `.trim();
  }

  /**
   * Parse AI response and ensure it matches our interface
   */
  static parseAIResponse(aiResponse, resumeText) {
    try {
      // Clean the response to extract JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate and sanitize the response
      const result = {
        score: Math.max(0, Math.min(100, parsed.score || 0)),
        feedback: {
          formatting: parsed.feedback?.formatting || 'Unable to assess formatting',
          skills: parsed.feedback?.skills || 'Unable to assess skills',
          grammar: parsed.feedback?.grammar || 'Unable to assess grammar',
          impact: parsed.feedback?.impact || 'Unable to assess impact',
          atsCompatibility: parsed.feedback?.atsCompatibility || 'Unable to assess ATS compatibility'
        },
        recommendations: Array.isArray(parsed.recommendations)
          ? parsed.recommendations.slice(0, 6)
          : ['Consider adding specific metrics to quantify achievements'],
        missingKeywords: Array.isArray(parsed.missingKeywords)
          ? parsed.missingKeywords.slice(0, 8)
          : [],
        strengths: Array.isArray(parsed.strengths)
          ? parsed.strengths.slice(0, 5)
          : ['Professional presentation'],
        extractedText: resumeText
      };

      return result;
    } catch (error) {
      console.error('Failed to parse AI response:', error);

      // Fallback response if parsing fails
      return this.getFallbackAnalysis(resumeText);
    }
  }

  /**
   * Provide fallback analysis if AI analysis fails
   */
  static getFallbackAnalysis(resumeText) {
    const wordCount = resumeText.split(/\s+/).length;
    const hasContactInfo = /(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)|(\b\d{3}[-.]?\d{3}[-.]?\d{4}\b)/.test(resumeText);

    const baseScore = 50;
    let adjustedScore = baseScore;

    if (wordCount > 200) adjustedScore += 10;
    if (hasContactInfo) adjustedScore += 15;
    if (resumeText.toLowerCase().includes('experience')) adjustedScore += 10;
    if (resumeText.toLowerCase().includes('education')) adjustedScore += 10;

    return {
      score: Math.min(adjustedScore, 100),
      feedback: {
        formatting: 'Document structure appears standard',
        skills: wordCount > 300 ? 'Good content length detected' : 'Consider expanding skill descriptions',
        grammar: 'Professional tone maintained',
        impact: 'Consider adding quantified achievements',
        atsCompatibility: hasContactInfo ? '75% - Contact information present' : '60% - Ensure contact information is clear'
      },
      recommendations: [
        'Add specific metrics to quantify your achievements',
        'Include relevant technical skills for your industry',
        'Ensure consistent formatting throughout',
        'Use strong action verbs to start bullet points'
      ],
      missingKeywords: ['Leadership', 'Project Management', 'Communication', 'Problem Solving'],
      strengths: [
        'Professional document format',
        hasContactInfo ? 'Clear contact information' : 'Organized content structure'
      ],
      extractedText: resumeText
    };
  }
}
