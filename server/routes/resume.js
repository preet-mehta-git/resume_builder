import { Resume } from "../models/Resume.js";
import { connectDB } from "../config/database.js";

export const handleCreateResume = async (req, res) => {
  try {
    await connectDB();
    const userId = req.user._id;
    const { title, template, status, data } = req.body;

    console.log('Creating resume with data:', { title, template, status, hasData: !!data });

    // Extract data from nested structure if present
    let resumeData = {};
    if (data) {
      resumeData = {
        personalInfo: data.personalInfo || {},
        education: data.education || [],
        experience: data.experience || [],
        skills: data.skills || [],
        summary: data.summary || '',
        certifications: data.certifications || [],
        projects: data.projects || []
      };
    }

    const resume = new Resume({
      userId,
      title: title || 'Untitled Resume',
      template: template || 'modern',
      status: status || 'draft',
      data: req.body, // Store original request for flexibility
      ...resumeData
    });

    await resume.save();

    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: { resume }
    });

  } catch (error) {
    console.error('Create resume error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create resume',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleGetResumes = async (req, res) => {
  try {
    await connectDB();
    const userId = req.user._id;
    
    const resumes = await Resume.find({ userId }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: { resumes }
    });

  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get resumes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleGetResume = async (req, res) => {
  try {
    await connectDB();
    const userId = req.user._id;
    const { id } = req.params;

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.json({
      success: true,
      data: { resume }
    });

  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get resume',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleUpdateResume = async (req, res) => {
  try {
    await connectDB();
    const userId = req.user._id;
    const { id } = req.params;
    const { title, template, status, data } = req.body;

    console.log('Updating resume with data:', { id, title, template, status, hasData: !!data });

    // Extract data from nested structure if present
    let updateData = {
      title: title || 'Untitled Resume',
      template: template || 'modern',
      status: status || 'draft',
      data: req.body // Store original request for flexibility
    };

    if (data) {
      updateData = {
        ...updateData,
        personalInfo: data.personalInfo || {},
        education: data.education || [],
        experience: data.experience || [],
        skills: data.skills || [],
        summary: data.summary || '',
        certifications: data.certifications || [],
        projects: data.projects || []
      };
    }

    const resume = await Resume.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.json({
      success: true,
      message: 'Resume updated successfully',
      data: { resume }
    });

  } catch (error) {
    console.error('Update resume error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update resume',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleDeleteResume = async (req, res) => {
  try {
    await connectDB();
    const userId = req.user._id;
    const { id } = req.params;

    const resume = await Resume.findOneAndDelete({ _id: id, userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
