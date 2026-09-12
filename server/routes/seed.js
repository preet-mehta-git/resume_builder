import { User } from "../models/User.js";
import { Resume } from "../models/Resume.js";
import { connectDB } from "../config/database.js";

export const handleSeedDatabase = async (req, res) => {
  try {
    await connectDB();
    // Check if data already exists
    const existingUser = await User.findOne({ email: 'demo@example.com' });
    if (existingUser) {
      return res.json({
        success: true,
        message: 'Database already seeded'
      });
    }

    // Create demo user
    const demoUser = new User({
      username: 'demo_user',
      email: 'demo@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });

    await demoUser.save();

    // Create sample resume
    const sampleResume = new Resume({
      userId: demoUser._id,
      title: 'Software Engineer Resume - Modern',
      template: 'modern',
      personalInfo: {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        address: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/johndoe',
        website: 'johndoe.dev'
      },
      education: [{
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2018',
        endDate: '2022',
        gpa: '3.8'
      }],
      experience: [{
        company: 'Tech Corp',
        position: 'Software Engineer',
        startDate: '2022',
        endDate: '2024',
        current: false,
        description: 'Developed and maintained web applications using React and Node.js. Led a team of 3 developers and improved application performance by 40%.'
      }, {
        company: 'Startup Inc',
        position: 'Junior Developer',
        startDate: '2021',
        endDate: '2022',
        current: false,
        description: 'Built responsive web interfaces and collaborated with designers to implement user-friendly features.'
      }],
      skills: [
        { name: 'JavaScript', level: 'Expert' },
        { name: 'React', level: 'Advanced' },
        { name: 'Node.js', level: 'Advanced' },
        { name: 'Python', level: 'Intermediate' },
        { name: 'MongoDB', level: 'Intermediate' },
        { name: 'Docker', level: 'Beginner' }
      ],
      summary: 'Passionate software engineer with 3+ years of experience in full-stack development. Skilled in modern web technologies and committed to writing clean, efficient code.',
      certifications: [{
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2023'
      }],
      projects: [{
        name: 'Resume Builder App',
        description: 'A full-stack application for creating professional resumes with multiple templates',
        url: 'github.com/johndoe/resume-builder',
        date: '2024'
      }]
    });

    await sampleResume.save();

    res.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        user: {
          email: demoUser.email,
          password: 'password123'
        },
        resumeCount: 1
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed database',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
