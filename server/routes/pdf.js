import { PDFGenerator } from "../services/pdfGenerator.js";
import { Resume } from "../models/Resume.js";
import path from "path";
import fs from "fs-extra";

export const handleGenerateCustomPDF = async (req, res) => {
  try {
    const { resume_data, template, resume_id } = req.body;
    const userId = req.user._id;

    console.log('=== SERVER PDF GENERATION DEBUG ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Template received:', template);
    console.log('Template type:', typeof template);
    console.log('Resume ID:', resume_id);
    console.log('User ID:', userId);
    console.log('Full request body:', JSON.stringify(req.body, null, 2));

    let resumeDataToUse = resume_data;

    // If resume_id is provided, fetch from database
    if (resume_id) {
      const resume = await Resume.findOne({ _id: resume_id, userId });
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      // Convert resume to the expected format
      resumeDataToUse = {
        personal_info: resume.personalInfo,
        education: resume.education,
        experience: resume.experience,
        skills: resume.skills,
        summary: resume.summary,
        certifications: resume.certifications,
        projects: resume.projects
      };
    } else if (!resume_data) {
      return res.status(400).json({
        success: false,
        message: 'Resume data or resume ID is required'
      });
    }

    // Validate and use template
    const validTemplates = ['modern', 'classic', 'creative', 'elegant', 'executive', 'minimal', 'technical', 'latex-classic', 'latex-modern', 'latex-minimal', 'latex-sidebar'];
    const finalTemplate = validTemplates.includes(template) ? template : 'modern';

    console.log('=== TEMPLATE VALIDATION DEBUG ===');
    console.log('Template validation:', {
      requested: template,
      requestedType: typeof template,
      requestedLength: template?.length,
      isValid: validTemplates.includes(template),
      finalTemplate,
      finalTemplateType: typeof finalTemplate,
      validTemplatesList: validTemplates
    });

    if (template && !validTemplates.includes(template)) {
      console.warn(`⚠️  Invalid template requested: "${template}". Falling back to "modern"`);
      console.warn('Request body template field:', JSON.stringify(template));
    } else {
      console.log(`✅ Using valid template: "${finalTemplate}"`);
      if (template === 'executive') {
        console.log('🎯 EXECUTIVE TEMPLATE CONFIRMED - This should generate Executive style PDF');
      }
    }

    // Generate PDF
    const htmlContent = PDFGenerator.generateHTML(resumeDataToUse, finalTemplate);
    const result = await PDFGenerator.generatePDF(resumeDataToUse, finalTemplate);

    if (result.success) {
      return res.json({
        success: true,
        message: 'PDF generated successfully',
        filename: result.filename,
        html: htmlContent
      });
    } else {
      // Return HTML as fallback so client can render PDF directly
      return res.json({
        success: true,
        fallback: true,
        html: htmlContent,
        message: 'Generated resume content for client download'
      });
    }


  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'PDF generation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleDownloadPDF = async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user?._id;

    console.log(`PDF download requested: ${filename} by user: ${userId}`);

    // Security check - ensure filename is safe
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      console.log(`Invalid filename rejected: ${filename}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const pdfDir = path.join(process.cwd(), 'temp', 'pdfs');
    const filePath = path.join(pdfDir, filename);

    console.log(`Checking file path: ${filePath}`);

    // Check if file exists
    if (!await fs.pathExists(filePath)) {
      console.log(`File not found: ${filePath}`);
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    console.log(`Serving PDF file: ${filename}`);

    // Send file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('PDF download error:', error);
    return res.status(500).json({
      success: false,
      message: 'File download failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleCleanupPDFs = async (_req, res) => {
  try {
    await PDFGenerator.cleanupOldFiles();
    
    res.json({
      success: true,
      message: 'PDF cleanup completed'
    });

  } catch (error) {
    console.error('PDF cleanup error:', error);
    return res.status(500).json({
      success: false,
      message: 'PDF cleanup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
