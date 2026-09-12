import multer from "multer";
import { TextExtractor } from "../services/textExtractor.js";
import { AIAnalyzer } from "../services/aiAnalyzer.js";

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

export const uploadMiddleware = upload.single('resume');

export const handleResumeAnalysis = async (req, res) => {
  try {
    console.log('🔄 Starting resume analysis...');

    // Check if file was uploaded
    if (!req.file) {
      console.log('❌ No file uploaded');
      const errorResponse = {
        error: 'NO_FILE',
        message: 'No resume file uploaded'
      };
      return res.status(400).json(errorResponse);
    }

    console.log(`📄 Processing file: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);

    // Check if required services are available
    const geminiKey = process.env.GEMINI_API_KEY || "AIzaSyBYr2lN1BBqOAh0jTg_grt_wlm3yo129XY";
    if (!geminiKey) {
      console.log('❌ Gemini API key not configured');
      const errorResponse = {
        error: 'AI_SERVICE_ERROR',
        message: 'AI analysis service is not configured properly'
      };
      return res.status(500).json(errorResponse);
    }


    // Extract text from the uploaded file
    console.log('🔍 Extracting text from file...');
    const extractedText = await TextExtractor.extractText(
      req.file.buffer,
      req.file.mimetype
    );

    if (!extractedText || extractedText.length < 50) {
      console.log(`❌ Insufficient text extracted: ${extractedText?.length || 0} characters`);
      const errorResponse = {
        error: 'INSUFFICIENT_CONTENT',
        message: 'Could not extract sufficient text from the resume. Please ensure the file contains readable text.'
      };
      return res.status(400).json(errorResponse);
    }

    console.log(`✅ Extracted ${extractedText.length} characters of text`);

    // Clean the text
    const cleanedText = TextExtractor.cleanText(extractedText);
    console.log(`🧹 Cleaned text: ${cleanedText.length} characters`);

    // Analyze the resume with AI
    console.log('🤖 Starting AI analysis...');
    const analysisResult = await AIAnalyzer.analyzeResume(cleanedText);

    console.log(`�� Analysis completed with score: ${analysisResult.score}`);

    // Return the analysis result
    res.json(analysisResult);

  } catch (error) {
    console.error('Resume analysis error:', error);
    
    let errorResponse;
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid file type')) {
        errorResponse = {
          error: 'INVALID_FILE_TYPE',
          message: 'Please upload a PDF, DOC, or DOCX file'
        };
        return res.status(400).json(errorResponse);
      }
      
      if (error.message.includes('File too large')) {
        errorResponse = {
          error: 'FILE_TOO_LARGE',
          message: 'File size must be less than 10MB'
        };
        return res.status(400).json(errorResponse);
      }
      
      if (error.message.includes('GEMINI_API_KEY')) {
        errorResponse = {
          error: 'AI_SERVICE_ERROR',
          message: 'AI analysis service is not configured properly'
        };
        return res.status(500).json(errorResponse);
      }
    }
    
    errorResponse = {
      error: 'ANALYSIS_FAILED',
      message: 'Failed to analyze resume. Please try again.'
    };
    
    res.status(500).json(errorResponse);
  }
};
