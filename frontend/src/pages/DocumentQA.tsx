
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, MessageCircle } from 'lucide-react';

const DocumentQA = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setAnswer(''); // Clear previous answer
    } else {
      alert('Please upload a PDF file only.');
    }
  };

  const handleAskQuestion = async () => {
    if (!uploadedFile || !question.trim()) return;

    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setAnswer(`Based on your uploaded document "${uploadedFile.name}" and your question "${question}", here's what I found: This appears to be a legal document that contains relevant information about your query. The specific section that addresses your question indicates that the terms and conditions outline the responsibilities of each party. For a more detailed analysis, I recommend consulting with a legal professional who can provide specific advice based on the complete context of your document.`);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy mb-4">Document Q&A</h1>
          <p className="text-xl text-gray-600">
            Upload any legal document and ask specific questions about its content
          </p>
        </div>

        {/* Upload Section */}
        <Card className="shadow-soft border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-navy flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {uploadedFile ? uploadedFile.name : 'Click to upload PDF document'}
                </p>
                <p className="text-sm text-gray-500">
                  {uploadedFile ? 'File uploaded successfully!' : 'Drag and drop or click to browse (PDF only)'}
                </p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Question Section */}
        {uploadedFile && (
          <Card className="shadow-soft border-0 mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-navy flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Ask a Question
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about this document..."
                className="border-gray-300 focus:border-teal focus:ring-teal"
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              />
              <Button
                onClick={handleAskQuestion}
                disabled={!question.trim() || isLoading}
                className="bg-teal hover:bg-teal-light text-white px-8"
              >
                {isLoading ? 'Analyzing...' : 'Get Answer'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Answer Section */}
        {answer && (
          <Card className="shadow-soft border-0 bg-white">
            <CardHeader className="bg-teal/5">
              <CardTitle className="text-xl text-navy">AI Analysis Result</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">{answer}</p>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and does not constitute legal advice. 
                  Always consult with a qualified attorney for legal matters.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg text-gray-600">Analyzing your document...</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!uploadedFile && (
          <Card className="shadow-soft border-0 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-navy mb-4">How it works:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Upload a PDF document (contracts, agreements, legal forms, etc.)</li>
                <li>Ask specific questions about the document content</li>
                <li>Get AI-powered answers and explanations</li>
                <li>Use the insights to better understand your legal documents</li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DocumentQA;
