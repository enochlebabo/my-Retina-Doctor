import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Camera, Upload, Send, X, Eye, AlertTriangle, CheckCircle, Loader2, Stethoscope, Brain } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function VisionChatBot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI Vision Assistant. Upload a retinal image for professional analysis or ask me about eye health.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const quickQuestions = [
    "What is CNV?",
    "How to prevent diabetic retinopathy?",
    "What does Drusen indicate?",
    "Signs of glaucoma?",
    "Normal retinal appearance"
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage({
          file: file,
          preview: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    
    // Add user message with image
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: `Analyzing retinal image: ${uploadedImage.name}`,
      image: uploadedImage.preview,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI analysis
    setTimeout(() => {
      const mockResults = [
        {
          condition: 'Normal Retina',
          confidence: 98.5,
          description: 'The retinal image shows normal fundus appearance with healthy blood vessels, clear optic disc, and no pathological changes detected.',
          recommendations: ['Continue regular annual eye exams', 'Maintain healthy lifestyle and diet', 'Monitor any vision changes'],
          riskLevel: 'low',
          clinicalNotes: 'No immediate intervention required. Patient shows excellent retinal health.'
        },
        {
          condition: 'Non-Proliferative Diabetic Retinopathy',
          confidence: 87.2,
          description: 'Microaneurysms and small hemorrhages detected in the posterior pole, consistent with mild non-proliferative diabetic retinopathy.',
          recommendations: ['Immediate ophthalmologist consultation', 'Optimize blood sugar control', 'Schedule follow-up in 3-6 months'],
          riskLevel: 'high',
          clinicalNotes: 'Early diabetic changes noted. Requires monitoring and possible intervention.'
        },
        {
          condition: 'Age-Related Macular Degeneration (Early)',
          confidence: 92.1,
          description: 'Multiple hard and soft drusen deposits observed in the macula, suggesting early-stage age-related macular degeneration.',
          recommendations: ['Ophthalmology referral within 2 weeks', 'AREDS2 vitamin supplementation', 'Amsler grid monitoring'],
          riskLevel: 'medium',
          clinicalNotes: 'Early AMD changes. Patient education and monitoring essential.'
        }
      ];

      const result = mockResults[Math.floor(Math.random() * mockResults.length)];
      setAnalysisResult(result);

      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Analysis completed! Here are the clinical findings:',
        analysis: result,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsAnalyzing(false);
    }, 3000);
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response with medical knowledge
    setTimeout(() => {
      const responses = {
        "What is CNV?": "CNV (Choroidal Neovascularization) is the abnormal growth of blood vessels beneath the retina, commonly associated with wet age-related macular degeneration. These vessels can leak fluid and blood, causing vision distortion and potential scarring.",
        "How to prevent diabetic retinopathy?": "Prevention involves maintaining optimal blood glucose control (HbA1c <7%), managing blood pressure (<140/90 mmHg), controlling cholesterol levels, regular dilated eye exams, and following a comprehensive diabetes care plan.",
        "What does Drusen indicate?": "Drusen are yellow deposits of lipids and proteins beneath the retina. Small, hard drusen are common with aging, while large, soft drusen may indicate increased risk for age-related macular degeneration and require monitoring.",
        "Signs of glaucoma?": "Early glaucoma is often asymptomatic. Advanced signs include peripheral vision loss, tunnel vision, eye pain, halos around lights, and increased intraocular pressure. Regular comprehensive eye exams are essential for early detection.",
        "Normal retinal appearance": "A healthy retina shows clear, well-defined blood vessels, a pink optic disc with distinct margins, uniform background coloration, and no hemorrhages, exudates, or abnormal growths."
      };

      const response = responses[inputMessage] || "I understand you're asking about retinal health. For specific medical advice, please consult with a qualified ophthalmologist. I can help analyze retinal images or provide general educational information about eye conditions.";

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInputMessage('');
  };

  const removeImage = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'bg-[#E8F5E8] text-[#27AE60] border-[#27AE60]';
      case 'medium': return 'bg-[#FFF8E1] text-[#F39C12] border-[#F39C12]';
      case 'high': return 'bg-[#FADBD8] text-[#E74C3C] border-[#E74C3C]';
      default: return 'bg-gray-50 text-gray-600 border-gray-300';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[700px] flex flex-col medical-shadow-lg border-0 bg-white">
      <CardHeader className="pb-4 bg-gradient-to-r from-[#E3F2FD] to-[#E8F5E8] rounded-t-lg">
        <CardTitle className="flex items-center space-x-3">
          <div className="relative">
            <Eye className="h-8 w-8 text-[#0A3D62]" />
            <Brain className="h-4 w-4 text-[#27AE60] absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
          </div>
          <div>
            <span className="text-[#0A3D62] text-xl">AI Vision Assistant</span>
            <p className="text-sm text-[#6C757D] font-normal -mt-1">Medical-Grade Analysis • GPT-4.1 Vision</p>
          </div>
        </CardTitle>
        <p className="text-sm text-[#6C757D] mt-2">
          Upload retinal images for professional AI analysis or ask questions about eye health conditions
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 p-6">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 max-h-80">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-[#0A3D62] text-white'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 text-[#0A3D62] border border-gray-200'
                }`}
              >
                {message.image && (
                  <ImageWithFallback
                    src={message.image}
                    alt="Uploaded retinal image"
                    className="w-full h-32 object-cover rounded-lg mb-3 border"
                  />
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {message.analysis && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getRiskColor(message.analysis.riskLevel)} border font-medium`}>
                        {getRiskIcon(message.analysis.riskLevel)}
                        <span className="ml-2">{message.analysis.condition}</span>
                      </Badge>
                      <div className="text-right">
                        <span className="text-xs font-medium">Confidence Score</span>
                        <div className="text-lg font-bold medical-data">
                          {message.analysis.confidence}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/50 rounded-lg p-3 border">
                      <h5 className="font-medium text-[#0A3D62] mb-2 flex items-center">
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Clinical Findings
                      </h5>
                      <p className="text-xs leading-relaxed">{message.analysis.description}</p>
                    </div>
                    
                    <div className="bg-white/50 rounded-lg p-3 border">
                      <h5 className="font-medium text-[#0A3D62] mb-2">Recommendations</h5>
                      <ul className="text-xs space-y-1">
                        {message.analysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="h-3 w-3 text-[#27AE60] mt-0.5 mr-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {message.analysis.clinicalNotes && (
                      <div className="bg-[#E3F2FD] rounded-lg p-3 border border-[#0A3D62]/20">
                        <h5 className="font-medium text-[#0A3D62] mb-1 text-xs">Clinical Notes</h5>
                        <p className="text-xs text-[#0A3D62]">{message.analysis.clinicalNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isAnalyzing && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl flex items-center space-x-3 border">
                <Loader2 className="h-5 w-5 animate-spin text-[#0A3D62]" />
                <div>
                  <span className="text-sm font-medium text-[#0A3D62]">Analyzing retinal image...</span>
                  <p className="text-xs text-[#6C757D]">Processing with medical-grade AI</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Image Upload Area */}
        {uploadedImage && (
          <div className="relative rounded-lg overflow-hidden border-2 border-[#0A3D62]/20">
            <ImageWithFallback
              src={uploadedImage.preview}
              alt="Uploaded retinal image"
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
            {!isAnalyzing && !analysisResult && (
              <Button
                className="absolute bottom-2 right-2 bg-[#27AE60] hover:bg-[#229A5C] text-white"
                size="sm"
                onClick={analyzeImage}
              >
                <Brain className="h-4 w-4 mr-2" />
                Analyze Image
              </Button>
            )}
            <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
              {uploadedImage.name}
            </div>
          </div>
        )}

        {/* Quick Questions */}
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question) => (
            <Button
              key={question}
              variant="outline"
              size="sm"
              className="text-xs border-[#0A3D62]/30 text-[#0A3D62] hover:bg-[#0A3D62] hover:text-white"
              onClick={() => setInputMessage(question)}
            >
              {question}
            </Button>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex space-x-2">
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-[#0A3D62] text-[#0A3D62] hover:bg-[#0A3D62] hover:text-white"
              title="Upload Image"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCameraCapture}
              className="border-[#27AE60] text-[#27AE60] hover:bg-[#27AE60] hover:text-white"
              title="Capture Image"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about retinal health conditions..."
            className="flex-1 border-[#0A3D62]/30 focus:border-[#0A3D62]"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          
          <Button 
            onClick={sendMessage} 
            disabled={!inputMessage.trim()}
            className="bg-[#0A3D62] hover:bg-[#1E5F8B] text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Medical Disclaimer */}
        <Alert className="border-[#F39C12] bg-[#FFF8E1]">
          <AlertTriangle className="h-4 w-4 text-[#F39C12]" />
          <AlertDescription className="text-xs text-[#F39C12]">
            <strong>Medical Disclaimer:</strong> This AI tool provides educational analysis only and is not a substitute for professional medical diagnosis. 
            Always consult with a qualified ophthalmologist for medical advice and treatment decisions.
          </AlertDescription>
        </Alert>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}