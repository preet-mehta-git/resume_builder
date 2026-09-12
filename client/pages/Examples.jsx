import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { FileText, ArrowLeft, Eye, Download } from "lucide-react";
import TemplateModern from "@/components/templates/TemplateModern.jsx";
import TemplateClassic from "@/components/templates/TemplateClassic.jsx";
import TemplateCreative from "@/components/templates/TemplateCreative.jsx";

const sampleData = {
  personalInfo: {
    fullName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 987-6543",
    address: "New York, NY",
    linkedin: "linkedin.com/in/sarahjohnson",
    website: "sarahjohnson.dev"
  },
  education: [
    {
      id: "1",
      institution: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science",
      startDate: "2020-09",
      endDate: "2022-06",
      gpa: "3.9/4.0"
    },
    {
      id: "2",
      institution: "UC Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2016-08",
      endDate: "2020-05",
      gpa: "3.7/4.0"
    }
  ],
  experience: [
    {
      id: "1",
      company: "Meta",
      position: "Senior Software Engineer",
      startDate: "2022-07",
      endDate: "",
      current: true,
      description: "Lead frontend development for React-based applications serving millions of users\nImplemented performance optimizations reducing page load times by 40%\nMentored junior developers and conducted code reviews\nCollaborated with design teams to create intuitive user experiences"
    },
    {
      id: "2",
      company: "Apple",
      position: "Software Engineer",
      startDate: "2020-06",
      endDate: "2022-06",
      current: false,
      description: "Developed iOS applications using Swift and Objective-C\nContributed to core system features affecting millions of devices\nWorked in cross-functional teams to deliver high-quality software\nParticipated in design reviews and technical discussions"
    }
  ],
  skills: [
    { id: "1", name: "JavaScript", level: "Expert" },
    { id: "2", name: "React", level: "Expert" },
    { id: "3", name: "TypeScript", level: "Advanced" },
    { id: "4", name: "Node.js", level: "Advanced" },
    { id: "5", name: "Python", level: "Advanced" },
    { id: "6", name: "Swift", level: "Intermediate" },
    { id: "7", name: "AWS", level: "Intermediate" },
    { id: "8", name: "Docker", level: "Intermediate" }
  ]
};

export default function Examples() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Redirect if not authenticated
  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <Card className="w-full max-w-md solid-dark-card shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-400 font-heading">Authentication Required</CardTitle>
            <CardDescription className="text-gray-300">
              Please log in to view resume examples and templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-dark-gold text-black hover:opacity-90 shadow-lg"
            >
              Go to Login
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full bg-transparent border-primary text-primary hover:bg-primary/10"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const templates = [
    { 
      id: "modern", 
      name: "Modern Template", 
      description: "Clean and professional with gradients and modern design elements",
      component: TemplateModern,
      color: "from-blue-500 to-purple-600"
    },
    { 
      id: "classic", 
      name: "Classic Template", 
      description: "Traditional and formal layout perfect for conservative industries",
      component: TemplateClassic,
      color: "from-gray-600 to-gray-800"
    },
    { 
      id: "creative", 
      name: "Creative Template", 
      description: "Eye-catching design with sidebar layout for creative professionals",
      component: TemplateCreative,
      color: "from-purple-500 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-lg border-b border-gray-700/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-primary hover:bg-gray-800">
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Back to </span>Home
              </Button>
            </Link>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-dark-gold rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary font-heading truncate">Resume Examples</h1>
          </div>
          <Link to="/builder">
            <Button className="bg-gradient-dark-gold text-black hover:opacity-90 shadow-lg text-sm sm:text-base">
              Start Building
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-6 font-heading">
            Professional Resume Templates
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Choose from our collection of professionally designed resume templates.
            Each template is crafted to help you stand out and land your dream job.
          </p>
        </div>

        <div className="space-y-16">
          {templates.map((template, index) => {
            const TemplateComponent = template.component;
            return (
              <div key={template.id} className="space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-dark-gold text-black font-semibold mb-6 shadow-lg">
                    {template.name}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 font-heading">
                    {template.name}
                  </h3>
                  <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <div className="solid-dark-card rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50">
                  <div className="p-4 bg-black/50 border-b border-gray-700/50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTemplate(template)}
                        className="bg-transparent border-primary text-primary hover:bg-primary/10"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Size
                      </Button>
                      <Link to="/builder">
                        <Button size="sm" className="bg-gradient-dark-gold text-black hover:opacity-90">
                          Use This Template
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="p-8 bg-gray-800/30">
                    <div className="transform scale-50 origin-top-left" style={{ width: '200%', height: '400px', overflow: 'hidden' }}>
                      <TemplateComponent
                        personalInfo={sampleData.personalInfo}
                        education={sampleData.education}
                        experience={sampleData.experience}
                        skills={sampleData.skills}
                      />
                    </div>
                  </div>
                </div>

                {index < templates.length - 1 && (
                  <div className="border-b border-gray-600 mx-auto w-24"></div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-12 text-white border border-primary/30 shadow-2xl">
            <h3 className="text-4xl font-bold mb-6 font-heading text-primary">Ready to Build Your Resume?</h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Choose your favorite template and start building your professional resume in minutes with our AI-powered builder.
            </p>
            <Link to="/builder">
              <Button size="lg" className="text-lg px-10 py-6 bg-gradient-dark-gold text-black hover:opacity-90 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Start Building Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Full Size Modal */}
      {selectedTemplate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTemplate(null)}
        >
          <div
            className="solid-dark-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <h3 className="text-xl font-semibold text-white font-heading">{selectedTemplate.name} - Full Size Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
                className="bg-transparent border-primary text-primary hover:bg-primary/10"
              >
                Close
              </Button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-120px)]">
              <div className="p-6 bg-gray-800/30">
                {(() => {
                  const TemplateComponent = selectedTemplate.component;
                  return (
                    <TemplateComponent
                      personalInfo={sampleData.personalInfo}
                      education={sampleData.education}
                      experience={sampleData.experience}
                      skills={sampleData.skills}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
