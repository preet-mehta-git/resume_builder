import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/database.js";
import { handleDemo } from "./routes/demo.js";
import { handleResumeAnalysis, uploadMiddleware } from "./routes/resumeAnalysis.js";
import { handleGenerateCustomPDF, handleDownloadPDF, handleCleanupPDFs } from "./routes/pdf.js";
import { handleRegister, handleLogin, handleLogout, handleGetProfile } from "./routes/auth.js";
import { handleCreateResume, handleGetResumes, handleGetResume, handleUpdateResume, handleDeleteResume } from "./routes/resume.js";
import { handleSeedDatabase } from "./routes/seed.js";
import { handleTestConnection } from "./routes/test.js";
import { authenticateToken } from "./middleware/auth.js";
import { PDFGenerator } from "./services/pdfGenerator.js";

export function createServer() {
  const app = express();

  // Connect to MongoDB and ensure it's successful
  connectDB().then((connected) => {
    if (connected) {
      console.log('🚀 Server ready with MongoDB connection');
    } else {
      console.error('🚨 Failed to connect to MongoDB - server may not function properly');
      console.error('💡 Please check your MongoDB Atlas connection and try again');
    }
  }).catch((error) => {
    console.error('🚨 Critical error during MongoDB connection:', error);
  });

  // Ensure PDF output directory exists
  PDFGenerator.ensureOutputDir().catch(console.error);

  // Middleware
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Test connection
  app.get("/api/test", handleTestConnection);

  // Database seeding (for development)
  app.post("/api/seed", handleSeedDatabase);

  // Authentication routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/auth/profile", authenticateToken, handleGetProfile);

  // Resume management routes (protected)
  app.post("/api/resumes", authenticateToken, handleCreateResume);
  app.get("/api/resumes", authenticateToken, handleGetResumes);
  app.get("/api/resumes/:id", authenticateToken, handleGetResume);
  app.put("/api/resumes/:id", authenticateToken, handleUpdateResume);
  app.delete("/api/resumes/:id", authenticateToken, handleDeleteResume);

  // Resume analysis route with file upload (with error handling)
  app.post("/api/analyze-resume", (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error('Upload middleware error:', err);
        return res.status(400).json({
          error: 'UPLOAD_ERROR',
          message: err.message || 'File upload failed'
        });
      }
      next();
    });
  }, handleResumeAnalysis);

  // Test endpoint for AI analysis
  app.get("/api/test-analysis", (req, res) => {
    res.json({
      success: true,
      message: "AI Analysis endpoint is working",
      geminiApiConfigured: "AIzaSyBYr2lN1BBqOAh0jTg_grt_wlm3yo129XY",
      geminiModel: "gemini-2.0-flash-exp",
      timestamp: new Date().toISOString()
    });
  });

  // Test AI analysis with sample data
  app.post("/api/test-ai", async (req, res) => {
    try {
      const { AIAnalyzer } = await import("./services/aiAnalyzer.js");

      const sampleResume = `
        John Smith
        Software Engineer
        john.smith@email.com
        +1 (555) 123-4567

        EXPERIENCE
        Senior Software Engineer at Google (2022-Present)
        - Developed scalable microservices architecture
        - Led team of 5 developers
        - Improved system performance by 40%

        EDUCATION
        Master of Science in Computer Science
        Stanford University (2018-2020)
        GPA: 3.8/4.0

        SKILLS
        JavaScript, Python, React, Node.js, AWS
      `;

      const result = await AIAnalyzer.analyzeResume(sampleResume);
      res.json({
        success: true,
        message: "AI analysis completed successfully",
        data: result
      });
    } catch (error) {
      console.error('Test AI analysis error:', error);
      res.status(500).json({
        success: false,
        message: "AI analysis test failed",
        error: error.message
      });
    }
  });

  // PDF generation routes (protected)
  app.post("/api/pdf/generate-custom", authenticateToken, handleGenerateCustomPDF);
  app.get("/api/pdf/download/:filename", authenticateToken, handleDownloadPDF);
  app.post("/api/pdf/cleanup", authenticateToken, handleCleanupPDFs);

  return app;
}
