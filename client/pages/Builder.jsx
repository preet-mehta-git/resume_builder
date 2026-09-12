import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.js";
import { downloadElementAsPdf } from "@/lib/pdfDownloader.js";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
// Simple select component - we'll use native select for now
import { Badge } from "@/components/ui/badge.jsx";
import { Plus, Minus, FileText, User, GraduationCap, Briefcase, Award, Languages, Download, Eye, Palette, BarChart3, MessageSquare, Shield, Folder, Sparkles, Save, LogOut, Home, RefreshCw } from "lucide-react";

// Import templates
import TemplateModern from "@/components/templates/TemplateModern.jsx";
import TemplateClassic from "@/components/templates/TemplateClassic.jsx";
import TemplateCreative from "@/components/templates/TemplateCreative.jsx";
import TemplateElegant from "@/components/templates/TemplateElegant.jsx";
import TemplateExecutive from "@/components/templates/TemplateExecutive.jsx";
import TemplateMinimal from "@/components/templates/TemplateMinimal.jsx";
import TemplateTechnical from "@/components/templates/TemplateTechnical.jsx";
import TemplateLatexClassic from "@/components/templates/TemplateLatexClassic.jsx";
import TemplateLatexModern from "@/components/templates/TemplateLatexModern.jsx";
import TemplateLatexMinimal from "@/components/templates/TemplateLatexMinimal.jsx";
import TemplateLatexSidebar from "@/components/templates/TemplateLatexSidebar.jsx";

// Import scoring component
import ResumeScoring from "@/components/ResumeScoring.jsx";

export default function Builder() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [activeSection, setActiveSection] = useState("personal");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [showPreview, setShowPreview] = useState(false);
  const [sidePreview, setSidePreview] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const resumePreviewRef = useRef(null);
  const [resumeScore, setResumeScore] = useState(85);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);
  const [scoreDetails, setScoreDetails] = useState(null);
  const [lastApiFailure, setLastApiFailure] = useState(null);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    website: ""
  });

  const [education, setEducation] = useState([
    {
      id: "1",
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: ""
    }
  ]);

  const [experience, setExperience] = useState([
    {
      id: "1",
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    }
  ]);

  const [skills, setSkills] = useState([
    { id: "1", name: "", level: "Beginner" }
  ]);

  const [summary, setSummary] = useState("");

  const [certifications, setCertifications] = useState([
    { id: "1", name: "", issuer: "", date: "" }
  ]);

  const [projects, setProjects] = useState([
    { id: "1", name: "", description: "", technologies: [] }
  ]);

  // Sample data for demonstration
  const sampleData = {
    personalInfo: {
      fullName: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      address: "New York, NY, USA",
      linkedin: "linkedin.com/in/johnsmith",
      website: "johnsmith.dev"
    },
    summary: "Experienced Software Engineer with 5+ years of expertise in full-stack development, cloud technologies, and agile methodologies. Proven track record of delivering scalable solutions and leading cross-functional teams to achieve business objectives.",
    education: [
      {
        id: "1",
        institution: "Stanford University",
        degree: "Master of Science",
        field: "Computer Science",
        startDate: "2018",
        endDate: "2020",
        gpa: "3.8"
      },
      {
        id: "2",
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science",
        field: "Computer Engineering",
        startDate: "2014",
        endDate: "2018",
        gpa: "3.6"
      }
    ],
    experience: [
      {
        id: "1",
        company: "Google",
        position: "Senior Software Engineer",
        startDate: "2022",
        endDate: "",
        current: true,
        description: "• Led development of scalable microservices architecture serving 10M+ users\n• Improved system performance by 40% through optimization and caching strategies\n• Mentored junior developers and established best practices for code quality"
      },
      {
        id: "2",
        company: "Meta",
        position: "Software Engineer",
        startDate: "2020",
        endDate: "2022",
        current: false,
        description: "• Developed and maintained React-based user interfaces for social media platform\n• Collaborated with product managers to implement new features affecting millions of users\n• Reduced page load times by 30% through code splitting and lazy loading"
      }
    ],
    skills: [
      { id: "1", name: "JavaScript", level: "Expert" },
      { id: "2", name: "Python", level: "Advanced" },
      { id: "3", name: "React", level: "Expert" },
      { id: "4", name: "Node.js", level: "Advanced" },
      { id: "5", name: "AWS", level: "Intermediate" }
    ],
    certifications: [
      { id: "1", name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", date: "2023" },
      { id: "2", name: "Google Cloud Professional Developer", issuer: "Google Cloud", date: "2022" }
    ],
    projects: [
      {
        id: "1",
        name: "E-commerce Platform",
        description: "Built a full-stack e-commerce platform using React, Node.js, and MongoDB. Implemented payment processing, inventory management, and real-time notifications.",
        technologies: ["React", "Node.js", "MongoDB", "Stripe API"]
      },
      {
        id: "2",
        name: "AI Resume Analyzer",
        description: "Developed an AI-powered resume analysis tool using machine learning algorithms to provide feedback and scoring for job applications.",
        technologies: ["Python", "TensorFlow", "Flask", "React"]
      }
    ]
  };

  const loadSampleData = () => {
    setIsLoadingSample(true);
    setTimeout(() => {
      setPersonalInfo(sampleData.personalInfo);
      setSummary(sampleData.summary);
      setEducation(sampleData.education);
      setExperience(sampleData.experience);
      setSkills(sampleData.skills);
      setCertifications(sampleData.certifications);
      setProjects(sampleData.projects);
      setIsLoadingSample(false);
    }, 1000);
  };

  const addEducation = () => {
    const newId = (education.length + 1).toString();
    setEducation([...education, {
      id: newId,
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: ""
    }]);
  };

  const removeEducation = (id) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const updateEducation = (id, field, value) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const addExperience = () => {
    const newId = (experience.length + 1).toString();
    setExperience([...experience, {
      id: newId,
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    }]);
  };

  const removeExperience = (id) => {
    setExperience(experience.filter(exp => exp.id !== id));
  };

  const updateExperience = (id, field, value) => {
    setExperience(experience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const addSkill = () => {
    const newId = (skills.length + 1).toString();
    setSkills([...skills, { id: newId, name: "", level: "Beginner" }]);
  };

  const removeSkill = (id) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const updateSkill = (id, field, value) => {
    setSkills(skills.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const addCertification = () => {
    const newId = (certifications.length + 1).toString();
    setCertifications([...certifications, { id: newId, name: "", issuer: "", date: "" }]);
  };

  const removeCertification = (id) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
  };

  const updateCertification = (id, field, value) => {
    setCertifications(certifications.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  const addProject = () => {
    const newId = (projects.length + 1).toString();
    setProjects([...projects, { id: newId, name: "", description: "", technologies: [] }]);
  };

  const removeProject = (id) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const updateProject = (id, field, value) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, [field]: value } : project
    ));
  };

  const sections = [
    { id: "personal", label: "Personal Info", icon: User, color: "from-blue-500 to-indigo-500" },
    { id: "summary", label: "Summary", icon: MessageSquare, color: "from-purple-500 to-pink-500" },
    { id: "education", label: "Education", icon: GraduationCap, color: "from-emerald-500 to-green-500" },
    { id: "experience", label: "Experience", icon: Briefcase, color: "from-orange-500 to-red-500" },
    { id: "skills", label: "Skills", icon: Award, color: "from-cyan-500 to-blue-500" },
    { id: "certifications", label: "Certifications", icon: Shield, color: "from-teal-500 to-emerald-500" },
    { id: "projects", label: "Projects", icon: Folder, color: "from-violet-500 to-purple-500" },
    { id: "templates", label: "Templates", icon: Palette, color: "from-pink-500 to-rose-500" },
  ];

  const templates = [
    { id: "modern", name: "Modern", description: "Clean and professional with gradients", component: TemplateModern },
    { id: "classic", name: "Classic", description: "Traditional and formal layout", component: TemplateClassic },
    { id: "creative", name: "Creative", description: "Eye-catching design with sidebar", component: TemplateCreative },
    { id: "elegant", name: "Elegant", description: "Sophisticated design with refined typography", component: TemplateElegant },
    { id: "executive", name: "Executive", description: "Professional layout for senior positions", component: TemplateExecutive },
    { id: "minimal", name: "Minimal", description: "Clean and simple design focused on content", component: TemplateMinimal },
    { id: "technical", name: "Technical", description: "Optimized for technical and engineering roles", component: TemplateTechnical },
    { id: "latex-classic", name: "LaTeX Classic", description: "Academic-style with blue headers and serif fonts", component: TemplateLatexClassic },
    { id: "latex-modern", name: "LaTeX Modern", description: "Two-column layout with colored sidebar", component: TemplateLatexModern },
    { id: "latex-minimal", name: "LaTeX Minimal", description: "Clean sans-serif with focused sections", component: TemplateLatexMinimal },
    { id: "latex-sidebar", name: "LaTeX Sidebar", description: "Professional CV with colored left panel", component: TemplateLatexSidebar },
  ];

  const handleGeneratePDF = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to generate PDF",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      console.log('=== PDF GENERATION DEBUG ===');
      console.log('Selected Template:', selectedTemplate);
      console.log('Selected Template Type:', typeof selectedTemplate);
      console.log('Available Templates:', templates.map(t => t.id));
      console.log('Template exists in list:', templates.some(t => t.id === selectedTemplate));
      console.log('Template object:', templates.find(t => t.id === selectedTemplate));

      // Validate template before sending
      if (!templates.some(t => t.id === selectedTemplate)) {
        toast({
          title: "Template Error",
          description: `Invalid template: ${selectedTemplate}. Using default template.`,
          variant: "destructive"
        });
        setSelectedTemplate("modern");
        return;
      }

      // Final template verification
      const templateObj = templates.find(t => t.id === selectedTemplate);
      if (!templateObj) {
        toast({
          title: "Template Error",
          description: `Template "${selectedTemplate}" not found. Please select a valid template.`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Final Template Verification:', {
        id: templateObj.id,
        name: templateObj.name,
        description: templateObj.description,
        componentExists: !!templateObj.component
      });

      const resumeData = {
        resume_data: {
          personal_info: personalInfo,
          education,
          experience,
          skills,
          summary,
          certifications,
          projects
        },
        template: selectedTemplate
      };

      console.log('PDF Request Data:', JSON.stringify(resumeData, null, 2));

      const response = await fetch('/api/pdf/generate-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resumeData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        if (result.filename && !result.fallback) {
          // Download the generated PDF from server if available
          const downloadResponse = await fetch(`/api/pdf/download/${result.filename}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (downloadResponse.ok) {
            const blob = await downloadResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `resume-${personalInfo.fullName || 'resume'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
              title: "PDF Generated",
              description: "Your resume has been downloaded successfully!"
            });
            return;
          }
        }

        // If server provided HTML content directly (serverless Vercel fallback)
        if (result.html) {
          toast({
            title: "Generating PDF",
            description: "Creating PDF document...",
          });

          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.width = '8.5in';
          tempDiv.innerHTML = result.html;
          document.body.appendChild(tempDiv);

          await downloadElementAsPdf(tempDiv, `resume-${personalInfo.fullName || 'resume'}.pdf`);
          document.body.removeChild(tempDiv);

          toast({
            title: "PDF Downloaded",
            description: "Your resume has been downloaded successfully!"
          });
          return;
        }
      } else {
        throw new Error(result.message || 'PDF generation failed');
      }
    } catch (error) {
      console.warn('Backend PDF generation failed, attempting direct template export...', error);
      try {
        const previewEl = document.getElementById('printable-resume-preview') || resumePreviewRef.current;
        if (previewEl) {
          toast({
            title: "Exporting Resume",
            description: "Generating PDF directly from template...",
          });
          await downloadElementAsPdf(previewEl, `resume-${personalInfo.fullName || 'resume'}.pdf`);
          toast({
            title: "PDF Downloaded",
            description: "Your resume has been downloaded successfully!"
          });
          return;
        }
      } catch (clientPdfError) {
        console.error('Client PDF fallback error:', clientPdfError);
      }


      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to save draft",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const resumeData = {
        title: `${personalInfo.fullName || 'Untitled'} Resume`,
        data: {
          personalInfo,
          education,
          experience,
          skills,
          summary,
          certifications,
          projects,
          template: selectedTemplate
        },
        template: selectedTemplate,
        status: 'draft'
      };

      console.log('=== SAVE DRAFT DEBUG ===');
      console.log('Saving resume data:', JSON.stringify(resumeData, null, 2));
      console.log('Current resume ID:', currentResumeId);
      console.log('Token present:', !!token);

      let response;
      if (currentResumeId) {
        // Update existing resume
        response = await fetch(`/api/resumes/${currentResumeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(resumeData)
        });
      } else {
        // Create new resume
        response = await fetch('/api/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(resumeData)
        });
      }

      let result;
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Unable to read error response';
        }
        console.error('Save draft response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      } else {
        result = await response.json();
        console.log('Save draft success response:', result);
      }

      if (result.success) {
        setCurrentResumeId(result.data.resume._id);
        toast({
          title: "Draft Saved",
          description: "Your resume draft has been saved successfully!"
        });
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save draft error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const calculateResumeScore = async () => {
    setIsCalculatingScore(true);
    try {
      const resumeData = {
        personalInfo,
        education,
        experience,
        skills,
        summary,
        certifications,
        projects
      };

      // Convert resume data to text format for analysis
      const resumeText = `
        ${personalInfo.fullName || 'Name not provided'}
        ${personalInfo.email || ''}
        ${personalInfo.phone || ''}

        SUMMARY:
        ${summary || 'No summary provided'}

        EXPERIENCE:
        ${experience.map(exp => `
          ${exp.position || 'Position'} at ${exp.company || 'Company'}
          ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}
          ${exp.description || ''}
        `).join('\n')}

        EDUCATION:
        ${education.map(edu => `
          ${edu.degree || 'Degree'} in ${edu.field || 'Field'}
          ${edu.institution || 'Institution'}
          ${edu.startDate} - ${edu.endDate}
        `).join('\n')}

        SKILLS:
        ${skills.map(skill => skill.name).filter(Boolean).join(', ')}

        PROJECTS:
        ${projects.map(proj => `
          ${proj.name || 'Project'}: ${proj.description || ''}
          Technologies: ${Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies || ''}
        `).join('\n')}

        CERTIFICATIONS:
        ${certifications.map(cert => `
          ${cert.name || 'Certification'} - ${cert.issuer || 'Issuer'} (${cert.date || ''})
        `).join('\n')}
      `.trim();

      // First try the Node.js AI analyzer (with network error handling)
      // Skip API call if we've had a recent failure (within last 30 seconds)
      const now = Date.now();
      const skipApiCall = lastApiFailure && (now - lastApiFailure) < 30000;

      if (!skipApiCall) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch('/api/test-ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resumeText: resumeText,
            resumeData: resumeData
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            let score = result.data.overall_score || result.data.score || 85;
            // Ensure score is within 0-100 range
            score = Math.max(0, Math.min(100, score));
            setResumeScore(Math.round(score));
            setScoreDetails(result.data);
            console.log('Resume score calculated via AI:', score);
            return; // Exit early if AI analysis succeeded
          } else {
            console.log('AI analysis returned unsuccessful result:', result.message || 'Unknown error');
            // Check if it's a quota/rate limit issue
            if (result.error && (result.error.includes('quota') || result.error.includes('rate') || result.error.includes('429'))) {
              setLastApiFailure(Date.now());
              console.log('AI service quota exceeded, will use fallback scoring for next 30 seconds');
            }
          }
        } else {
          console.log(`AI endpoint returned ${response.status}, using fallback scoring`);
          if (response.status === 429) {
            setLastApiFailure(Date.now());
          }
        }
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          console.log('AI service request timed out, using fallback scoring');
        } else if (fetchError.message?.includes('Failed to fetch')) {
          console.log('Network connection error to AI service, using fallback scoring');
        } else {
          console.log('Error connecting to AI service, using fallback scoring:', fetchError.message);
        }
        // Mark API failure time to prevent excessive retries
        setLastApiFailure(Date.now());
        // Don't re-throw the error, just continue to fallback
        }
      } else {
        console.log('Skipping AI service call due to recent failure, using fallback scoring');
      }

      // Fallback scoring when AI is unavailable
      {
        // Enhanced fallback scoring algorithm
        let score = 0;
        let categoryScores = {};

        // Personal info completeness (25 points)
        const personalFields = ['fullName', 'email', 'phone', 'address'];
        const filledPersonal = personalFields.filter(field => personalInfo[field]?.trim()).length;
        const personalScore = (filledPersonal / personalFields.length) * 25;
        score += personalScore;
        categoryScores.personal_info = personalScore;

        // Experience quality and depth (30 points)
        const validExperience = experience.filter(exp => exp.company && exp.position).length;
        const experienceWithDescription = experience.filter(exp =>
          exp.company && exp.position && exp.description?.trim()
        ).length;
        let experienceScore = Math.min(validExperience * 10, 20); // Basic experience
        experienceScore += Math.min(experienceWithDescription * 5, 10); // Detailed descriptions
        score += experienceScore;
        categoryScores.experience = experienceScore;

        // Education (15 points)
        const validEducation = education.filter(edu => edu.institution && edu.degree).length;
        const educationScore = Math.min(validEducation * 15, 15);
        score += educationScore;
        categoryScores.education = educationScore;

        // Skills quantity and quality (15 points)
        const validSkills = skills.filter(skill => skill.name?.trim()).length;
        const skillsScore = Math.min(validSkills * 2, 15);
        score += skillsScore;
        categoryScores.skills = skillsScore;

        // Summary quality (10 points)
        let summaryScore = 0;
        if (summary?.trim()) {
          const wordCount = summary.trim().split(/\s+/).length;
          summaryScore = wordCount >= 20 ? 10 : Math.min(wordCount * 0.5, 10);
        }
        score += summaryScore;
        categoryScores.summary = summaryScore;

        // Projects (5 points)
        const validProjects = projects.filter(proj => proj.name?.trim()).length;
        const projectsScore = Math.min(validProjects * 2.5, 5);
        score += projectsScore;
        categoryScores.projects = projectsScore;

        const finalScore = Math.max(0, Math.min(100, score));
        setResumeScore(Math.round(finalScore));
        setScoreDetails({
          overall_score: Math.round(finalScore),
          category_scores: categoryScores,
          analysis_type: 'fallback',
          message: lastApiFailure && (Date.now() - lastApiFailure) < 30000
            ? 'Using enhanced local scoring (AI service temporarily unavailable)'
            : 'Using enhanced local scoring algorithm'
        });
      }
    } catch (error) {
      console.error('Resume scoring error:', error);
      // Calculate basic fallback score
      let score = 50; // Base score
      if (personalInfo.fullName) score += 10;
      if (personalInfo.email) score += 10;
      if (experience.some(exp => exp.company)) score += 15;
      if (education.some(edu => edu.institution)) score += 10;
      if (skills.some(skill => skill.name)) score += 5;

      setResumeScore(Math.round(score));
      setScoreDetails({
        overall_score: Math.round(score),
        analysis_type: 'basic_fallback',
        message: 'AI scoring temporarily unavailable - using basic calculation'
      });
    } finally {
      setIsCalculatingScore(false);
    }
  };

  // Load resume data if editing existing resume
  useEffect(() => {
    const resumeId = searchParams.get('resume');
    if (resumeId && token) {
      loadResumeData(resumeId);
    }
  }, [searchParams, token]);

  // Function to load resume data from API or use sample data
  const loadResumeData = async (resumeId) => {
    try {
      console.log('Loading resume:', resumeId);

      // First try to fetch from API
      const response = await fetch(`/api/resumes/${resumeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const resume = result.data.resume;

        // Load the resume data into state
        setPersonalInfo(resume.personalInfo || {
          fullName: "",
          email: "",
          phone: "",
          address: "",
          linkedin: "",
          website: ""
        });
        setEducation(resume.education || []);
        setExperience(resume.experience || []);
        setSkills(resume.skills || []);
        setSummary(resume.summary || "");
        setCertifications(resume.certifications || []);
        setProjects(resume.projects || []);
        setSelectedTemplate(resume.template || "modern");
        setCurrentResumeId(resumeId);

        toast({
          title: "✅ Resume Loaded",
          description: `${resume.title || 'Resume'} loaded successfully!`,
          duration: 3000
        });
      } else {
        // If API fails, use sample data based on resumeId
        loadResumeById(resumeId);
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      // Fallback to sample data
      loadResumeById(resumeId);
    }
  };

  // Function to load resume sample data based on resumeId
  const loadResumeById = (resumeId) => {
    const sampleData = {
      'sample-1': {
        personalInfo: {
          fullName: "John Smith",
          email: "john.smith@email.com",
          phone: "+1 (555) 123-4567",
          address: "San Francisco, CA",
          linkedin: "linkedin.com/in/johnsmith",
          website: "johnsmith.dev"
        },
        education: [{
          id: "1",
          institution: "Stanford University",
          degree: "Master of Science",
          field: "Computer Science",
          startDate: "2018",
          endDate: "2020",
          gpa: "3.8"
        }],
        experience: [{
          id: "1",
          company: "Google",
          position: "Senior Software Engineer",
          startDate: "2020",
          endDate: "",
          current: true,
          description: "• Led development of scalable microservices architecture\n• Managed team of 5 engineers\n• Improved system performance by 40%"
        }],
        skills: [
          { id: "1", name: "JavaScript", level: "Expert" },
          { id: "2", name: "React", level: "Expert" },
          { id: "3", name: "Node.js", level: "Advanced" },
          { id: "4", name: "Python", level: "Advanced" }
        ],
        summary: "Experienced Software Engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of leading high-performance teams and delivering scalable solutions.",
        template: "modern"
      },
      'sample-2': {
        personalInfo: {
          fullName: "Sarah Johnson",
          email: "sarah.johnson@email.com",
          phone: "+1 (555) 987-6543",
          address: "New York, NY",
          linkedin: "linkedin.com/in/sarahjohnson",
          website: "sarahjohnson.marketing"
        },
        education: [{
          id: "1",
          institution: "NYU",
          degree: "Bachelor of Arts",
          field: "Marketing",
          startDate: "2016",
          endDate: "2020",
          gpa: "3.7"
        }],
        experience: [{
          id: "1",
          company: "Digital Marketing Agency",
          position: "Senior Marketing Specialist",
          startDate: "2020",
          endDate: "",
          current: true,
          description: "• Developed and executed digital marketing campaigns\n• Increased client engagement by 65%\n• Managed social media strategy for 20+ clients"
        }],
        skills: [
          { id: "1", name: "Digital Marketing", level: "Expert" },
          { id: "2", name: "Social Media", level: "Expert" },
          { id: "3", name: "Analytics", level: "Advanced" },
          { id: "4", name: "Content Strategy", level: "Advanced" }
        ],
        summary: "Creative Marketing Specialist with 4+ years of experience in digital marketing, social media management, and content strategy. Proven ability to drive engagement and increase brand awareness.",
        template: "creative"
      }
    };

    const data = sampleData[resumeId] || sampleData['sample-1'];

    setPersonalInfo(data.personalInfo);
    setEducation(data.education);
    setExperience(data.experience);
    setSkills(data.skills);
    setSummary(data.summary);
    setSelectedTemplate(data.template);
    setCurrentResumeId(resumeId);

    toast({
      title: "📝 Sample Data Loaded",
      description: "Sample resume data loaded for editing!",
      duration: 3000
    });
  };

  // Auto-calculate score when data changes (with throttling to prevent excessive calls)
  useEffect(() => {
    // Skip auto-calculation if we've had a recent API failure or are already calculating
    const now = Date.now();
    const recentFailure = lastApiFailure && (now - lastApiFailure) < 60000; // 1 minute cooldown

    if (isCalculatingScore || recentFailure) {
      return;
    }

    const timer = setTimeout(() => {
      calculateResumeScore().catch((error) => {
        console.log('Auto-calculation failed, will use fallback scoring:', error.message);
        // Don't re-throw the error to prevent it from bubbling up
      });
    }, 2000); // Increased debounce to 2 seconds

    return () => clearTimeout(timer);
  }, [personalInfo, education, experience, skills, summary, certifications, projects]);

  const renderPersonalSection = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            value={personalInfo.fullName}
            onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
            placeholder="John Doe"
            className="h-12 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-primary focus:ring-primary/20"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
            placeholder="john@example.com"
            className="h-12 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-primary focus:ring-primary/20"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-semibold text-gray-300">
            Phone
          </Label>
          <Input
            id="phone"
            value={personalInfo.phone}
            onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
            placeholder="+1 (555) 123-4567"
            className="h-12 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-primary focus:ring-primary/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-semibold text-gray-300">
            Address
          </Label>
          <Input
            id="address"
            value={personalInfo.address}
            onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
            placeholder="City, State, Country"
            className="h-12 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-primary focus:ring-primary/20"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="linkedin" className="text-sm font-semibold text-gray-300">
            LinkedIn
          </Label>
          <Input
            id="linkedin"
            value={personalInfo.linkedin}
            onChange={(e) => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
            placeholder="linkedin.com/in/johndoe"
            className="h-12 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-primary focus:ring-primary/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm font-semibold text-gray-300">
            Website/Portfolio
          </Label>
          <Input
            id="website"
            value={personalInfo.website}
            onChange={(e) => setPersonalInfo({...personalInfo, website: e.target.value})}
            placeholder="johndoe.com"
            className="h-12 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-primary focus:ring-primary/20"
          />
        </div>
      </div>
    </div>
  );

  const renderSummarySection = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="summary" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Professional Summary
        </Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Write a compelling summary that highlights your key achievements, skills, and career goals..."
          className="min-h-[120px] bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-primary focus:ring-primary/20"
          rows={6}
        />
        <p className="text-sm text-gray-400">
          Tip: Keep it concise (2-3 sentences) and focus on what makes you unique
        </p>
      </div>
    </div>
  );

  const renderEducationSection = () => (
    <div className="space-y-6">
      {education.map((edu, index) => (
        <Card key={edu.id} className="border border-emerald-500/40 bg-gray-900/90 shadow-xl border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-emerald-400 font-heading">
              Education {index + 1}
            </CardTitle>
            {education.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeEducation(edu.id)}
                className="text-red-400 border-red-500/40 bg-transparent hover:text-red-300 hover:bg-red-500/10"
              >
                <Minus className="w-4 h-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-300">Institution</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                  placeholder="University of California"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-300">Degree</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                  placeholder="Bachelor of Science"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-300">Field of Study</Label>
                <Input
                  value={edu.field}
                  onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                  placeholder="Computer Science"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-300">Start Date</Label>
                <Input
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                  placeholder="2020"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-300">End Date</Label>
                <Input
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                  placeholder="2024"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-300">GPA (Optional)</Label>
              <Input
                value={edu.gpa}
                onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                placeholder="3.8"
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-emerald-500 focus:ring-emerald-500/20 max-w-xs"
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        onClick={addEducation}
        variant="outline"
        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:text-emerald-300 font-medium"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Education
      </Button>
    </div>
  );

  const renderExperienceSection = () => (
    <div className="space-y-6">
      {experience.map((exp, index) => (
        <Card key={exp.id} className="border border-orange-500/40 bg-gray-900/90 shadow-xl border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-orange-400 font-heading">
              Experience {index + 1}
            </CardTitle>
            {experience.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeExperience(exp.id)}
                className="text-red-400 border-red-500/40 bg-transparent hover:text-red-300 hover:bg-red-500/10"
              >
                <Minus className="w-4 h-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-300">Company</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                  placeholder="Google Inc."
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-orange-500 focus:ring-orange-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-300">Position</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                  placeholder="Software Engineer"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-orange-500 focus:ring-orange-500/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-300">Start Date</Label>
                <Input
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                  placeholder="Jan 2022"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-orange-500 focus:ring-orange-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-300">End Date</Label>
                <Input
                  value={exp.endDate}
                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                  placeholder="Present"
                  disabled={exp.current}
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-orange-500 focus:ring-orange-500/20 disabled:opacity-50 disabled:bg-gray-900"
                />
              </div>
              <div className="space-y-2 pt-2 sm:pt-6 flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`current-${exp.id}`}
                  checked={exp.current}
                  onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                  className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                />
                <Label htmlFor={`current-${exp.id}`} className="text-sm font-semibold text-gray-300 cursor-pointer">Current Role</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-300">Description</Label>
              <Textarea
                value={exp.description}
                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                placeholder="• Developed scalable web applications using React and Node.js&#10;• Led a team of 3 developers in implementing new features&#10;• Improved application performance by 40%"
                className="min-h-[100px] bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-orange-500 focus:ring-orange-500/20"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        onClick={addExperience}
        variant="outline"
        className="w-full bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/40 text-orange-400 hover:text-orange-300 font-medium"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Experience
      </Button>
    </div>
  );

  const renderSkillsSection = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {skills.map((skill, index) => (
          <Card key={skill.id} className="border border-cyan-500/40 bg-gray-900/90 shadow-xl border-l-4 border-l-cyan-500">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="text-sm font-semibold text-gray-300">Skill Name</Label>
                  <Input
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                    placeholder="JavaScript"
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                  />
                </div>
                <div className="w-full sm:w-40 space-y-2">
                  <Label className="text-sm font-semibold text-gray-300">Level</Label>
                  <select
                    value={skill.level}
                    onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                    className="flex h-12 w-full items-center justify-between rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                {skills.length > 1 && (
                  <div className="sm:self-end pb-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSkill(skill.id)}
                      className="text-red-400 border-red-500/40 bg-transparent hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Minus className="w-4 h-4 mr-1 sm:mr-0" />
                      <span className="sm:hidden text-xs">Remove</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button
        onClick={addSkill}
        variant="outline"
        className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/40 text-cyan-400 hover:text-cyan-300 font-medium"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Skill
      </Button>
    </div>
  );

  const renderCertificationsSection = () => (
    <div className="space-y-6">
      {certifications.map((cert, index) => (
        <Card key={cert.id} className="border border-teal-500/40 bg-gray-900/90 shadow-xl border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-teal-400 font-heading">
              Certification {index + 1}
            </CardTitle>
            {certifications.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCertification(cert.id)}
                className="text-red-400 border-red-500/40 bg-transparent hover:text-red-300 hover:bg-red-500/10"
              >
                <Minus className="w-4 h-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-300">Certification Name</Label>
                <Input
                  value={cert.name}
                  onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                  placeholder="AWS Certified Solutions Architect"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-teal-500 focus:ring-teal-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-300">Issuing Organization</Label>
                <Input
                  value={cert.issuer}
                  onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                  placeholder="Amazon Web Services"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-teal-500 focus:ring-teal-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-300">Date Obtained</Label>
                <Input
                  value={cert.date}
                  onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                  placeholder="2023"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-teal-500 focus:ring-teal-500/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        onClick={addCertification}
        variant="outline"
        className="w-full bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/40 text-teal-400 hover:text-teal-300 font-medium"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Certification
      </Button>
    </div>
  );

  const renderProjectsSection = () => (
    <div className="space-y-6">
      {projects.map((project, index) => (
        <Card key={project.id} className="border border-purple-500/40 bg-gray-900/90 shadow-xl border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-purple-400 font-heading">
              Project {index + 1}
            </CardTitle>
            {projects.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeProject(project.id)}
                className="text-red-400 border-red-500/40 bg-transparent hover:text-red-300 hover:bg-red-500/10"
              >
                <Minus className="w-4 h-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-300">Project Name</Label>
              <Input
                value={project.name}
                onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                placeholder="E-commerce Platform"
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-300">Description</Label>
              <Textarea
                value={project.description}
                onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                placeholder="Built a full-stack e-commerce platform with user authentication, payment processing, and real-time inventory management..."
                className="min-h-[100px] bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-purple-500 focus:ring-purple-500/20"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-300">Technologies Used</Label>
              <Input
                value={Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies}
                onChange={(e) => updateProject(project.id, 'technologies', e.target.value.split(', ').filter(tech => tech.trim()))}
                placeholder="React, Node.js, MongoDB, Express"
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:bg-gray-800 focus:text-white focus:border-purple-500 focus:ring-purple-500/20"
              />
              <p className="text-xs text-gray-400">Separate technologies with commas</p>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        onClick={addProject}
        variant="outline"
        className="w-full bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/40 text-purple-400 hover:text-purple-300 font-medium"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Project
      </Button>
    </div>
  );

  const renderTemplatesSection = () => (
    <div className="bg-background py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section with App Theme */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-lg mb-6">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>

          <h3 className="text-4xl font-bold text-foreground mb-4 font-heading">
            Professional Resume Templates
          </h3>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose from our collection of ATS-friendly, professionally designed templates.
            Each template is optimized for modern hiring practices.
          </p>

          {/* Active Template Indicator with App Theme */}
          <div className="inline-flex items-center gap-3 bg-card px-6 py-3 rounded-lg border border-border shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm font-medium text-card-foreground">Active Template:</span>
            </div>
            <span className="text-sm font-semibold text-primary">
              {templates.find(t => t.id === selectedTemplate)?.name || 'None selected'}
            </span>
          </div>
        </div>

        {/* Templates Grid with App Theme */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`group relative bg-card rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-lg ${
                selectedTemplate === template.id
                  ? 'border-primary shadow-md ring-2 ring-primary ring-opacity-20'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => {
                setSelectedTemplate(template.id);
                toast({
                  title: "✨ Template Selected",
                  description: `Switched to ${template.name} - Ready to customize!`,
                  duration: 3000
                });
              }}
            >
              {/* Template Preview with App Theme */}
              <div className="relative h-[380px] bg-secondary rounded-t-lg overflow-hidden">
                <div className="absolute inset-0 flex items-start justify-center p-4 pt-6">
                  <div className="scale-[0.7] origin-top transform">
                    <div
                      className="relative"
                      style={{
                        width: '350px',
                        height: '420px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)',
                        overflow: 'hidden',
                        fontSize: '10px'
                      }}
                    >
                      {(() => {
                        try {
                          const TemplateComponent = template.component;
                          return (
                            <TemplateComponent
                              personalInfo={{
                                fullName: "Sarah Martinez",
                                email: "sarah.martinez@email.com",
                                phone: "+1 (555) 987-6543",
                                address: "Los Angeles, CA"
                              }}
                              education={[{
                                id: "1",
                                institution: "University of California",
                                degree: "Master of Science",
                                field: "Computer Science",
                                startDate: "2020",
                                endDate: "2022"
                              }]}
                              experience={[{
                                id: "1",
                                company: "TechFlow Solutions",
                                position: "Senior Software Engineer",
                                startDate: "2022",
                                current: true,
                                description: "• Architected scalable microservices handling 1M+ requests daily\n• Led a team of 5 developers in agile development processes\n• Implemented CI/CD pipelines reducing deployment time by 60%"
                              }]}
                              skills={[
                                { id: "1", name: "JavaScript", level: "Expert" },
                                { id: "2", name: "React", level: "Expert" },
                                { id: "3", name: "Node.js", level: "Advanced" },
                                { id: "4", name: "Python", level: "Advanced" }
                              ]}
                              summary="Innovative software engineer with 3+ years of experience building high-performance web applications. Passionate about clean code, user experience, and emerging technologies."
                              certifications={[]}
                              projects={[]}
                            />
                          );
                        } catch (error) {
                          return (
                            <div className="flex items-center justify-center w-full h-full bg-secondary">
                              <div className="text-center">
                                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mx-auto mb-2">
                                  <FileText className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">Loading...</p>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>

                {/* Hover Overlay with App Theme */}
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="bg-card px-4 py-2 rounded-lg shadow-lg border border-border">
                    <span className="text-card-foreground font-medium text-sm">
                      {selectedTemplate === template.id ? 'Selected' : 'Select Template'}
                    </span>
                  </div>
                </div>

                {/* Selected Badge with App Theme */}
                {selectedTemplate === template.id && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-medium">
                    ACTIVE
                  </div>
                )}
              </div>

              {/* Template Info with App Theme */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-card-foreground mb-2">
                  {template.name}
                </h4>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Features with App Theme */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded">ATS-Optimized</span>
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded">Professional</span>
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded">Clean Design</span>
                  </div>
                </div>

                {/* Action Button with App Theme */}
                <button className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  selectedTemplate === template.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
                }`}>
                  {selectedTemplate === template.id ? 'Currently Active' : 'Select Template'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note with App Theme */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All templates are ATS-friendly and fully customizable to match your professional needs.
          </p>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "personal":
        return renderPersonalSection();
      case "summary":
        return renderSummarySection();
      case "education":
        return renderEducationSection();
      case "experience":
        return renderExperienceSection();
      case "skills":
        return renderSkillsSection();
      case "certifications":
        return renderCertificationsSection();
      case "projects":
        return renderProjectsSection();
      case "templates":
        return renderTemplatesSection();
      default:
        return renderPersonalSection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-20 right-20 w-96 h-96 border-2 border-primary/30 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 border border-accent/20 rotate-45"></div>
      </div>

      {/* Enhanced Dark Header */}
      <header className="bg-black/90 backdrop-blur-lg border-b border-gray-700/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-dark-gold rounded-xl flex items-center justify-center shadow-xl flex-shrink-0">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-primary font-heading truncate">
                CareerCraft Builder
              </h1>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <p className="text-xs sm:text-sm text-primary font-medium truncate">AI-Powered Design</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="bg-black/50 hover:bg-gray-800 border-gray-600 text-gray-300 hover:text-primary"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="bg-black/50 hover:bg-gray-800 border-gray-600 text-gray-300 hover:text-primary"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 relative z-10 max-w-full">
        <div className={`grid gap-6 lg:gap-8 ${sidePreview ? 'lg:grid-cols-6' : 'lg:grid-cols-4'}`}>
          {/* Enhanced Sidebar */}
          <div className={`${sidePreview ? 'lg:col-span-1' : 'lg:col-span-1'} space-y-6 min-w-0`}>
            {/* Navigation */}
            <Card className="solid-dark-card shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white font-heading">
                  <Palette className="w-5 h-5 text-primary" />
                  Build Sections
                </CardTitle>
                <div className="text-sm text-gray-300 mt-2">
                  Template: <span className="font-semibold text-primary">{selectedTemplate}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "default" : "ghost"}
                      className={`w-full justify-start transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-gradient-dark-gold text-black shadow-lg hover:shadow-xl'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-primary'
                      }`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <IconComponent className="w-4 h-4 mr-3" />
                      {section.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="solid-dark-card shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white font-heading">
                  <Download className="w-5 h-5 text-accent" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={loadSampleData}
                  variant="outline"
                  className="w-full bg-transparent border-accent text-accent hover:bg-accent/10"
                  disabled={isLoadingSample}
                >
                  {isLoadingSample ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Load Sample Data
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  className="w-full bg-transparent border-primary text-primary hover:bg-primary/10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
                <Button
                  onClick={() => setSidePreview(!sidePreview)}
                  variant="outline"
                  className="w-full bg-transparent border-accent text-accent hover:bg-accent/10"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  {sidePreview ? 'Hide Side Preview' : 'Side Preview'}
                </Button>
                <Button
                  onClick={() => {
                    console.log('🧪 TEMPLATE TEST:', {
                      selectedTemplate,
                      templateName: templates.find(t => t.id === selectedTemplate)?.name,
                      allTemplates: templates.map(t => t.id),
                      isValid: templates.some(t => t.id === selectedTemplate)
                    });
                    toast({
                      title: "Template Verification",
                      description: `✓ ${selectedTemplate} (${templates.find(t => t.id === selectedTemplate)?.name}) will be used for PDF`,
                      duration: 3000
                    });
                  }}
                  variant="outline"
                  className="w-full mb-2 bg-transparent border-accent text-accent hover:bg-accent/10"
                >
                  🧪 Verify Template Selection
                </Button>
                <Button
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPDF}
                  className="w-full bg-gradient-dark-gold text-black hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSaveDraft}
                  variant="outline"
                  className="w-full bg-transparent border-primary text-primary hover:bg-primary/10"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Resume Scoring */}
            <Card className="solid-dark-card shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white font-heading">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  Resume Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {isCalculatingScore ? (
                    <div className="animate-pulse">
                      <div className="text-3xl font-bold text-gray-400 mb-2">
                        Calculating...
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-gray-400 to-gray-500 h-3 rounded-full animate-pulse" style={{width: '50%'}}></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`text-3xl font-bold mb-2 cursor-pointer hover:scale-105 transition-transform ${
                          resumeScore >= 80 ? 'text-accent' :
                          resumeScore >= 60 ? 'text-primary' :
                          'text-red-400'
                        }`}
                        onClick={() => setShowScoreDetails(true)}
                        title="Click for detailed breakdown"
                      >
                        {resumeScore}%
                      </div>
                      <div className="text-sm text-gray-300 mb-4">
                        {resumeScore >= 80 ? 'Excellent Progress' :
                         resumeScore >= 60 ? 'Good Progress' :
                         'Needs Improvement'}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            resumeScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            resumeScore >= 60 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                            'bg-gradient-to-r from-red-500 to-pink-500'
                          }`}
                          style={{width: `${resumeScore}%`}}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {resumeScore >= 80 ? 'Your resume looks great!' :
                         resumeScore >= 60 ? 'Add more details to improve' :
                         'Fill in more sections'}
                      </p>
                      <Button
                        onClick={calculateResumeScore}
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs bg-transparent border-primary text-primary hover:bg-primary/10"
                        disabled={isCalculatingScore}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Refresh Score
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Main Content */}
          <div className={`${sidePreview ? 'lg:col-span-3' : 'lg:col-span-3'} min-w-0`}>
            <Card className="solid-dark-card shadow-2xl">
              <CardHeader className="pb-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-white font-heading">
                      {sections.find(s => s.id === activeSection)?.label || 'Resume Builder'}
                    </CardTitle>
                    <CardDescription className="text-gray-300 mt-2">
                      Fill in your information to create a professional resume
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/40">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Enhanced
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {renderActiveSection()}
              </CardContent>
            </Card>
          </div>

          {/* Side Preview Panel */}
          {sidePreview && (
            <div className="lg:col-span-2 hidden lg:block min-w-0 overflow-hidden">
              <Card className="solid-dark-card shadow-2xl sticky top-24 max-h-[calc(100vh-8rem)] overflow-hidden">
                <CardHeader className="pb-4 border-b border-gray-700">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <Eye className="w-5 h-5 text-primary" />
                      Live Preview
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="px-2 py-1 border border-gray-600 rounded text-xs bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSidePreview(false)}
                        className="text-gray-400 hover:text-white border-gray-600 bg-transparent h-7 w-7 p-0"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 overflow-auto max-h-[calc(100vh-12rem)]">
                  <div className="bg-gray-100 rounded-lg p-2 overflow-hidden max-w-full">
                    {(() => {
                      const selectedTemplateObj = templates.find(t => t.id === selectedTemplate);
                      if (selectedTemplateObj) {
                        const TemplateComponent = selectedTemplateObj.component;
                        return (
                          <div className="scale-[0.4] origin-top transform w-[250%] h-auto">
                            <TemplateComponent
                              personalInfo={personalInfo}
                              education={education}
                              experience={experience}
                              skills={skills}
                              summary={summary}
                              certifications={certifications}
                              projects={projects}
                            />
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Preview Modal/Panel */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-3xl w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Resume Preview</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-50 hover:bg-gray-100"
                >
                  Close Preview
                </Button>
              </div>
              <div className="p-6">
                {/* Template Selection */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <h4 className="text-lg font-semibold text-gray-700">Template:</h4>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resume Preview */}
                <div className="bg-gray-100 rounded-lg p-4 min-h-[600px] overflow-auto">
                  {(() => {
                    const selectedTemplateObj = templates.find(t => t.id === selectedTemplate);
                    if (selectedTemplateObj) {
                      const TemplateComponent = selectedTemplateObj.component;
                      return (
                        <div ref={resumePreviewRef} id="printable-resume-preview" className="scale-75 origin-top transform">
                          <TemplateComponent
                            personalInfo={personalInfo}
                            education={education}
                            experience={experience}
                            skills={skills}
                            summary={summary}
                            certifications={certifications}
                            projects={projects}
                          />
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Resume Preview</h4>
                            <p className="text-gray-500">Your resume preview will appear here</p>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score Details Modal */}
        {showScoreDetails && scoreDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-3xl w-full max-w-2xl max-h-[90vh] overflow-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Resume Score Breakdown</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowScoreDetails(false)}
                  className="bg-gray-50 hover:bg-gray-100"
                >
                  ✕
                </Button>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className={`text-4xl font-bold mb-2 ${
                    resumeScore >= 80 ? 'text-green-600' :
                    resumeScore >= 60 ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {resumeScore}%
                  </div>
                  <p className="text-gray-600">
                    {resumeScore >= 80 ? 'Excellent! Your resume is well-optimized.' :
                     resumeScore >= 60 ? 'Good progress! A few improvements can make it great.' :
                     'Your resume needs attention. Focus on the key areas below.'}
                  </p>
                </div>

                {scoreDetails.category_scores && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Category Breakdown:</h4>

                    {Object.entries(scoreDetails.category_scores).map(([category, score]) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700 capitalize">
                          {category.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                score >= 20 ? 'bg-green-500' :
                                score >= 10 ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{width: `${Math.min((score / 25) * 100, 100)}%`}}
                            ></div>
                          </div>
                          <span className="font-bold text-gray-900 w-12 text-right">
                            {Math.round(score)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {scoreDetails.analysis_type === 'fallback' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> This score is calculated using basic completeness metrics.
                      For AI-powered insights and detailed recommendations, try our advanced analysis feature.
                    </p>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={calculateResumeScore}
                    disabled={isCalculatingScore}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recalculate Score
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('DEBUG: Current selectedTemplate:', selectedTemplate);
                      toast({
                        title: "Current Template",
                        description: `Selected: ${selectedTemplate}`
                      });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Test Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowScoreDetails(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
