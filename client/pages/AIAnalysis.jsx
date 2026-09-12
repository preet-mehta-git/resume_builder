import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';
import { Progress } from '../components/ui/progress.jsx';
import { Upload, FileText, BarChart3, Brain, TrendingUp, LogOut, CheckCircle, AlertCircle, Star, Sparkles, Zap, Target, Award } from 'lucide-react';

const AIAnalysis = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Redirect if not authenticated
  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <Card className="w-full max-w-md solid-dark-card shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-400 font-heading">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-gray-300">
              Please log in to access AI resume analysis features
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError('');
        setAnalysisResult(null);
      } else {
        setError('Please upload a PDF or DOCX file only');
        setFile(null);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setUploadProgress(0);

    try {
      console.log('🐍 CONNECTING TO PYTHON BACKEND...');
      console.log('📄 File to analyze:', file.name, '|', file.size, 'bytes');

      const formData = new FormData();
      formData.append('resume', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('🚀 Sending request to Python Flask server...');
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Read response body once as text, then try to parse as JSON
      console.log('Response status:', response.status);
      console.log('Response content-type:', response.headers.get('content-type'));

      let responseText;
      let responseData;

      // Always read as text first to avoid body stream issues
      try {
        responseText = await response.text();
        console.log('Raw response received:', responseText.substring(0, 200) + '...');
      } catch (readError) {
        console.error('Error reading response text:', readError);
        throw new Error(`Failed to read server response: ${readError.message}`);
      }

      // Try to parse as JSON if response text looks like JSON
      if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
        try {
          responseData = JSON.parse(responseText);
          console.log('Successfully parsed JSON response');
        } catch (parseError) {
          console.warn('Failed to parse response as JSON:', parseError.message);
          // Continue with responseText only
        }
      }

      // Handle error responses
      if (!response.ok) {
        const errorMessage = responseData?.message ||
                           responseData?.error ||
                           `Server error: ${responseText.substring(0, 200)}`;
        throw new Error(errorMessage);
      }

      // Ensure we have valid JSON data for success responses
      if (!responseData) {
        throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 200)}`);
      }

      console.log('✅ PYTHON BACKEND RESPONSE RECEIVED!');
      console.log('🤖 Gemini AI Analysis Score:', responseData?.score || responseData?.overall_score);
      console.log('📊 Full Analysis Data:', responseData);

      setAnalysisResult(responseData);
      console.log('🎉 AI Analysis completed successfully via Python backend!');

    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700';
    if (score >= 60) return 'text-amber-700';
    return 'text-rose-700';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-gradient-to-br from-emerald-100 to-green-100 border-emerald-200';
    if (score >= 60) return 'bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-200';
    return 'bg-gradient-to-br from-rose-100 to-red-100 border-rose-200';
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
          <div
            className="flex items-center space-x-3 sm:space-x-4 cursor-pointer hover:opacity-80 transition-opacity duration-200 min-w-0"
            onClick={() => navigate('/')}
            title="Back to Home"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-dark-gold rounded-xl flex items-center justify-center shadow-xl flex-shrink-0">
              <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-primary font-heading truncate">
                CareerCraft AI Analyzer
              </h1>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <p className="text-xs sm:text-sm text-primary font-medium truncate">Powered by Google Gemini 2.5 Flash</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3 bg-black/50 rounded-full px-3 py-1.5 sm:py-2 border border-gray-600 max-w-xs truncate">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-dark-gold rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-black">{user.firstName[0]}</span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-300 truncate">
                Welcome, <span className="text-primary">{user.firstName}</span>
              </span>
            </div>
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
        {!analysisResult ? (
          /* Enhanced Upload Section */
          <div className="max-w-4xl mx-auto">
            <Card className="solid-dark-card shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-4xl font-bold mb-4">
                  <span className="text-white font-heading">
                    Upload Your Resume
                  </span>
                </CardTitle>
                <CardDescription className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Get comprehensive AI-powered analysis using Google Gemini 2.5 Flash. 
                  Upload your resume and receive detailed feedback, professional scoring, and actionable improvement suggestions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3 shadow-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}
                
                <div className="space-y-6">
                  {/* Python Backend Status */}
                  <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                      <div>
                        <div className="text-sm font-semibold text-accent">🐍 Python Backend Connected</div>
                        <div className="text-xs text-accent/80">
                          Flask server running | Gemini AI ready | Watch terminal for analysis logs
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="cursor-pointer h-16 text-lg border-2 border-dashed border-gray-600 hover:border-primary transition-all duration-200 bg-gray-800 text-white rounded-xl"
                    />
                    <p className="text-sm text-gray-400 mt-4 text-center">
                      Supported formats: PDF, DOCX (Max size: 10MB)
                    </p>
                  </div>

                  {file && (
                    <div className="flex items-center gap-4 text-gray-300 bg-primary/10 p-6 rounded-xl border border-primary/30 shadow-lg">
                      <div className="w-12 h-12 bg-gradient-dark-gold rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-black" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{file.name}</div>
                        <div className="text-sm text-gray-400">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <CheckCircle className="w-6 h-6 text-accent" />
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="space-y-6 p-6 bg-primary/10 rounded-xl border border-primary/30">
                      <div className="flex items-center justify-center gap-3 text-primary font-semibold text-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        Analyzing resume with Gemini AI...
                      </div>
                      <Progress value={uploadProgress} className="h-4 bg-gray-700" />
                      <p className="text-sm text-gray-400 text-center">
                        Our advanced AI is reading your resume and generating comprehensive insights
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    disabled={!file || isAnalyzing}
                    className="w-full h-16 bg-gradient-dark-gold text-black hover:opacity-90 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Analyzing with Gemini AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6 mr-3" />
                        Analyze Resume with AI
                      </>
                    )}
                  </Button>
                </div>

                {/* Enhanced Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-dark-gold rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <Brain className="w-8 h-8 text-black" />
                    </div>
                    <h4 className="font-bold text-xl text-white mb-4 font-heading">Gemini AI Analysis</h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Content quality assessment
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Grammar and language check
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Professional impact scoring
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Industry-specific insights
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-dark-gold rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <TrendingUp className="w-8 h-8 text-black" />
                    </div>
                    <h4 className="font-bold text-xl text-white mb-4 font-heading">Smart Recommendations</h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Actionable improvement tips
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Keyword optimization
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        ATS compatibility check
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Formatting suggestions
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-dark-gold rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <Award className="w-8 h-8 text-black" />
                    </div>
                    <h4 className="font-bold text-xl text-white mb-4 font-heading">Comprehensive Scoring</h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Overall resume score
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Section-wise breakdown
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Strengths identification
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Missing elements detection
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Enhanced Results Section */
          <div className="space-y-8 max-w-7xl mx-auto">
            {/* Enhanced Score Overview */}
            <Card className="solid-dark-card shadow-2xl">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                      AI Analysis Results
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600">
                      Comprehensive analysis powered by Google Gemini AI
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className={`text-center p-8 rounded-2xl border-2 ${getScoreBgColor(analysisResult.score)} shadow-lg transform hover:scale-105 transition-all duration-300`}>
                    <div className={`text-5xl font-bold ${getScoreColor(analysisResult.score)} mb-2`}>
                      {analysisResult.score}%
                    </div>
                    <div className="text-lg font-semibold text-gray-700">Overall Score</div>
                    <div className="text-sm text-gray-600 mt-2">AI-powered evaluation</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 text-center p-8 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {analysisResult.recommendations?.length || 0}
                    </div>
                    <div className="text-lg font-semibold text-gray-700">AI Recommendations</div>
                    <div className="text-sm text-gray-600 mt-2">Improvement suggestions</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 text-center p-8 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="text-4xl font-bold text-emerald-600 mb-2">
                      {analysisResult.strengths?.length || 0}
                    </div>
                    <div className="text-lg font-semibold text-gray-700">Identified Strengths</div>
                    <div className="text-sm text-gray-600 mt-2">Your best features</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Detailed Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced AI Feedback */}
              <Card className="solid-dark-card shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    AI Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(analysisResult.feedback || {}).map(([category, feedback]) => (
                    <div key={category} className="space-y-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                      <h4 className="font-bold capitalize text-gray-900 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{feedback}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Enhanced Recommendations & Strengths */}
              <Card className="solid-dark-card shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    Recommendations & Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Recommendations
                    </h4>
                    <ul className="space-y-3">
                      {(analysisResult.recommendations || []).map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-3 p-2 bg-white/50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      Strengths
                    </h4>
                    <ul className="space-y-3">
                      {(analysisResult.strengths || []).map((strength, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-3 p-2 bg-white/50 rounded-lg">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {analysisResult.missingKeywords && analysisResult.missingKeywords.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-amber-600" />
                        Missing Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.missingKeywords.map((keyword, index) => (
                          <span key={index} className="px-3 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 rounded-full text-xs font-semibold border border-amber-200">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Actions */}
            <div className="flex justify-center gap-6">
              <Button
                onClick={() => {
                  setAnalysisResult(null);
                  setFile(null);
                  setError('');
                }}
                variant="outline"
                className="px-8 py-4 text-lg bg-transparent border-primary text-primary hover:bg-primary/10 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Upload className="w-5 h-5 mr-2" />
                Analyze Another Resume
              </Button>
              <Button 
                onClick={() => navigate('/builder')}
                className="px-8 py-4 text-lg bg-gradient-dark-gold text-black hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Zap className="w-5 h-5 mr-2" />
                Build New Resume
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;
