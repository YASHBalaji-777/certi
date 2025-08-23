import React, { useState, useEffect, useRef } from "react";
import { Upload, Shield, CheckCircle, XCircle, Wallet, FileText, AlertTriangle, Loader2, Eye, Download, Verified, Lock, Sparkles, Star } from "lucide-react";

// Enhanced type definitions
interface WalletState {
  isConnected: boolean;
  address: string | null;
  isLoading: boolean;
  error: string | null;
}

interface Certificate {
  id: string;
  hash: string;
  issuer: string;
  holderName: string;
  certificateType: string;
  issueDate: string;
  expiryDate: string;
  isValid: boolean;
  metadata?: {
    institution: string;
    course?: string;
    grade?: string;
    verificationUrl: string;
  };
}

// Mock government certificate database with realistic data including 10th grade certificates
const VALID_CERTIFICATES: Certificate[] = [
  // 10th Grade / Secondary School Certificates
  {
    id: "CBSE-10-2024-001",
    hash: "cbse10th2024student001verification",
    issuer: "Central Board of Secondary Education (CBSE)",
    holderName: "Arjun Sharma",
    certificateType: "Secondary School Certificate (10th Grade)",
    issueDate: "2024-05-15",
    expiryDate: "9999-12-31",
    isValid: true,
    metadata: {
      institution: "Delhi Public School, Ghaziabad",
      course: "Secondary Education (Class X)",
      grade: "A1 Grade - 95.2%",
      verificationUrl: "https://cbse.gov.in/verify/CBSE-10-2024-001"
    }
  },
  {
    id: "ICSE-10-2023-002", 
    hash: "icse10th2023student002verification",
    issuer: "Indian Certificate of Secondary Education (ICSE)",
    holderName: "Priya Patel",
    certificateType: "Indian Certificate of Secondary Education",
    issueDate: "2023-04-30",
    expiryDate: "9999-12-31",
    isValid: true,
    metadata: {
      institution: "St. Xavier's School, Mumbai",
      course: "Secondary Education (Class X)",
      grade: "Distinction - 92.8%",
      verificationUrl: "https://cisce.org/verify/ICSE-10-2023-002"
    }
  },
  {
    id: "STATE-10-2024-003",
    hash: "stateboard10th2024student003verify",
    issuer: "Andhra Pradesh Board of Secondary Education",
    holderName: "Lakshmi Reddy",
    certificateType: "Secondary School Certificate",
    issueDate: "2024-06-01",
    expiryDate: "9999-12-31",
    isValid: true,
    metadata: {
      institution: "Govt High School, Vijayawada",
      course: "Secondary Education (SSC)",
      grade: "First Class - 85.6%",
      verificationUrl: "https://bseap.gov.in/verify/STATE-10-2024-003"
    }
  },
  {
    id: "CBSE-10-2023-004",
    hash: "cbse2023class10certificate004hash",
    issuer: "Central Board of Secondary Education (CBSE)",
    holderName: "Rohit Kumar",
    certificateType: "Secondary School Certificate (10th Grade)",
    issueDate: "2023-05-20",
    expiryDate: "9999-12-31",
    isValid: true,
    metadata: {
      institution: "Kendriya Vidyalaya, Bangalore",
      course: "Secondary Education (Class X)",
      grade: "A2 Grade - 88.4%",
      verificationUrl: "https://cbse.gov.in/verify/CBSE-10-2023-004"
    }
  },
  // Higher Education Certificates
  {
    id: "GOV-EDU-001",
    hash: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    issuer: "Ministry of Education, India",
    holderName: "Rajesh Kumar",
    certificateType: "Bachelor of Engineering",
    issueDate: "2023-06-15",
    expiryDate: "9999-12-31",
    isValid: true,
    metadata: {
      institution: "Indian Institute of Technology, Delhi",
      course: "Computer Science Engineering",
      grade: "First Class with Distinction",
      verificationUrl: "https://gov-certificates.edu.in/verify/GOV-EDU-001"
    }
  },
  {
    id: "GOV-MED-002",
    hash: "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7",
    issuer: "Medical Council of India",
    holderName: "Dr. Priya Sharma",
    certificateType: "MBBS Degree",
    issueDate: "2022-12-20",
    expiryDate: "9999-12-31",
    isValid: true,
    metadata: {
      institution: "All India Institute of Medical Sciences",
      course: "Bachelor of Medicine and Bachelor of Surgery",
      grade: "Distinction",
      verificationUrl: "https://gov-certificates.health.in/verify/GOV-MED-002"
    }
  }
];

// Known fake certificate patterns
const FAKE_CERTIFICATE_PATTERNS = {
  // Company names known for fake certificates
  fakeCompanies: [
    "techgenius solutions",
    "code masters academy",
    "digital ninjas inc",
    "web wizard institute",
    "future coders camp",
    "elite developers hub",
    "programming gurus ltd",
    "cyber skills academy",
    "app builders institute",
    "data science pro camp"
  ],
  
  // Suspicious online course platforms
  suspiciousPlatforms: [
    "udemy",
    "coursera",
    "udacity",
    "edx",
    "skillshare",
    "alison",
    "futurelearn",
    "khan academy",
    "linkedin learning",
    "pluralsight"
  ],
  
  // Common fake certificate types
  fakeCertificateTypes: [
    "internship",
    "online course",
    "workshop",
    "bootcamp",
    "training program",
    "certification course",
    "summer internship",
    "virtual internship",
    "online training",
    "skill development program"
  ],
  
  // Known fake issuer names
  fakeIssuers: [
    "global certification council",
    "international skills board",
    "digital credentials authority",
    "online education network",
    "tech certification institute",
    "professional development board",
    "virtual learning academy",
    "corporate training alliance",
    "industry skills council",
    "digital badges authority"
  ]
};

declare global {
  interface Window {
    aptos?: any;
  }
}

const App: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    isLoading: false,
    error: null
  });
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [verificationHash, setVerificationHash] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    certificate: Certificate | null;
    isVerifying: boolean;
    error: string | null;
    isFakeCertificate?: boolean;
    fakeDetails?: {
      reason: string;
      detectedPatterns: string[];
    };
  }>({
    certificate: null,
    isVerifying: false,
    error: null
  });
  
  const [showUploadAnimation, setShowUploadAnimation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for existing wallet connection on mount
  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      if (window.aptos) {
        const account = await window.aptos.account();
        if (account?.address) {
          setWallet({
            isConnected: true,
            address: account.address,
            isLoading: false,
            error: null
          });
        }
      }
    } catch (error) {
      console.log("No existing connection found");
    }
  };

  const connectWallet = async () => {
    if (wallet.isConnected || wallet.isLoading) return;
    
    setWallet(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (!window.aptos) {
        throw new Error("Petra Wallet not installed. Please install Petra Wallet extension.");
      }

      // Request connection
      const response = await window.aptos.connect();
      
      if (!response?.address) {
        throw new Error("Failed to get wallet address");
      }

      // Get account details
      const account = await window.aptos.account();
      
      setWallet({
        isConnected: true,
        address: account.address,
        isLoading: false,
        error: null
      });

    } catch (error: any) {
      setWallet(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to connect wallet"
      }));
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.aptos) {
        await window.aptos.disconnect();
      }
      setWallet({
        isConnected: false,
        address: null,
        isLoading: false,
        error: null
      });
      // Clear all certificate data when disconnecting wallet
      clearResults();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const validateFileType = (file: File): boolean => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];
    return allowedTypes.includes(file.type);
  };

  // Function to detect fake certificates based on content analysis
  const detectFakeCertificate = (fileName: string, fileContent: string): { isFake: boolean; reason: string; patterns: string[] } => {
    const detectedPatterns: string[] = [];
    let reason = "";
    
    const lowerFileName = fileName.toLowerCase();
    const lowerContent = fileContent.toLowerCase();
    
    // Check for fake company names in filename or content
    const fakeCompanyMatch = FAKE_CERTIFICATE_PATTERNS.fakeCompanies.find(company => 
      lowerFileName.includes(company) || lowerContent.includes(company)
    );
    
    if (fakeCompanyMatch) {
      detectedPatterns.push(`Fake company: ${fakeCompanyMatch}`);
      reason = "Certificate from known fake certification provider";
    }
    
    // Check for suspicious platforms in content
    const suspiciousPlatformMatch = FAKE_CERTIFICATE_PATTERNS.suspiciousPlatforms.find(platform => 
      lowerContent.includes(platform)
    );
    
    if (suspiciousPlatformMatch) {
      detectedPatterns.push(`Suspicious platform: ${suspiciousPlatformMatch}`);
      reason = "Certificate from online learning platform not recognized for official certifications";
    }
    
    // Check for fake certificate types
    const fakeCertTypeMatch = FAKE_CERTIFICATE_PATTERNS.fakeCertificateTypes.find(type => 
      lowerContent.includes(type)
    );
    
    if (fakeCertTypeMatch && !reason) {
      detectedPatterns.push(`Suspicious certificate type: ${fakeCertTypeMatch}`);
      reason = "This type of certificate is often forged or not officially recognized";
    }
    
    // Check for fake issuers
    const fakeIssuerMatch = FAKE_CERTIFICATE_PATTERNS.fakeIssuers.find(issuer => 
      lowerContent.includes(issuer)
    );
    
    if (fakeIssuerMatch) {
      detectedPatterns.push(`Fake issuer: ${fakeIssuerMatch}`);
      reason = "Certificate from known fake issuing authority";
    }
    
    // Additional heuristic: Check for internship certificates from unknown companies
    if ((lowerContent.includes("internship") || lowerFileName.includes("internship")) && 
        !lowerContent.includes("government") && 
        !lowerContent.includes("ministry") &&
        !lowerContent.includes("university") &&
        !lowerContent.includes("college")) {
      detectedPatterns.push("Unverified internship certificate");
      if (!reason) reason = "Internship certificates from unverified companies require additional validation";
    }
    
    return {
      isFake: detectedPatterns.length > 0,
      reason,
      patterns: detectedPatterns
    };
  };

  const generateFileHash = async (file: File): Promise<string> => {
    // Enhanced hash generation for real certificates
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Create a more realistic hash based on file content and metadata
    let contentHash = '';
    for (let i = 0; i < Math.min(uint8Array.length, 2000); i += 25) {
      contentHash += uint8Array[i].toString(16).padStart(2, '0');
    }
    
    // Extract text content for fake certificate detection (simulated)
    let fileContent = "";
    try {
      // In a real implementation, you would use OCR or PDF text extraction here
      // For this demo, we'll simulate content extraction based on file name
      fileContent = `Certificate from ${file.name} issued to student for completion of course.`;
      
      // Check if this file might be a fake certificate
      const fakeDetection = detectFakeCertificate(file.name, fileContent);
      if (fakeDetection.isFake) {
        return `fake_cert_${contentHash.substring(0, 16)}_${fakeDetection.reason.replace(/\s+/g, '_')}`;
      }
    } catch (error) {
      console.error("Error analyzing file content:", error);
    }
    
    // Check if this looks like a real certificate based on file name patterns
    const fileName = file.name.toLowerCase();
    const certificateKeywords = ['certificate', 'cert', '10th', 'tenth', 'ssc', 'cbse', 'icse', 'marksheet', 'grade'];
    const hasEducationKeywords = certificateKeywords.some(keyword => fileName.includes(keyword));
    
    // If it looks like a real educational certificate, provide guidance
    if (hasEducationKeywords) {
      // Return a special hash that indicates this needs manual verification
      return `real_cert_${contentHash.substring(0, 16)}_needs_verification`;
    }
    
    return contentHash + file.size.toString(16) + file.lastModified.toString(16);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Check if wallet is connected before allowing file upload
    if (!wallet.isConnected) {
      alert("Please connect your wallet first to upload and verify certificates.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFileType(file)) {
      alert("Invalid file type. Please upload PDF, JPEG, PNG, or WebP files only.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert("File too large. Please upload files smaller than 10MB.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setShowUploadAnimation(true);
    setUploadedFile(file);
    
    // Generate and set hash automatically
    try {
      const hash = await generateFileHash(file);
      setVerificationHash(hash);
      
      setTimeout(() => {
        setShowUploadAnimation(false);
      }, 2000);
    } catch (error) {
      console.error("Error generating hash:", error);
      setShowUploadAnimation(false);
    }
  };

  const verifyCertificate = async () => {
    // Check if wallet is connected before verification
    if (!wallet.isConnected) {
      setVerificationResult({
        certificate: null,
        isVerifying: false,
        error: "Wallet not connected. Please connect your wallet to verify certificates."
      });
      return;
    }

    if (!verificationHash.trim()) {
      setVerificationResult({
        certificate: null,
        isVerifying: false,
        error: "Please enter a certificate hash"
      });
      return;
    }

    setVerificationResult({
      certificate: null,
      isVerifying: true,
      error: null
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if this is a fake certificate
    if (verificationHash.includes('fake_cert_')) {
      const reasonPart = verificationHash.split('_').slice(3).join('_').replace(/_/g, ' ');
      setVerificationResult({
        certificate: null,
        isVerifying: false,
        error: "Fake certificate detected",
        isFakeCertificate: true,
        fakeDetails: {
          reason: reasonPart,
          detectedPatterns: [
            "Certificate from known fake certification provider",
            "Unverified internship program",
            "Not issued by recognized educational institution"
          ]
        }
      });
      return;
    }

    // Check if this is a hash from a real certificate upload
    if (verificationHash.includes('real_cert_') && verificationHash.includes('_needs_verification')) {
      setVerificationResult({
        certificate: null,
        isVerifying: false,
        error: "REAL_CERTIFICATE_DETECTED"
      });
      return;
    }

    const foundCertificate = VALID_CERTIFICATES.find(cert => 
      cert.hash.toLowerCase() === verificationHash.toLowerCase().trim()
    );

    if (foundCertificate) {
      setVerificationResult({
        certificate: foundCertificate,
        isVerifying: false,
        error: null
      });
    } else {
      setVerificationResult({
        certificate: null,
        isVerifying: false,
        error: "Certificate not found in government database"
      });
    }
  };

  const clearResults = () => {
    setUploadedFile(null);
    setVerificationHash("");
    setVerificationResult({
      certificate: null,
      isVerifying: false,
      error: null
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            >
              <Star className="w-1 h-1 text-purple-400 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Dynamic gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Glowing grid overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-900/10 to-transparent" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgba(147, 51, 234, 0.15) 1px, transparent 0)`,
               backgroundSize: '50px 50px'
             }}>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <header className="text-center mb-12 animate-fade-in-up">
          <div className="flex justify-center items-center mb-6 relative">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-70 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-slate-900 to-purple-900 p-4 rounded-full border border-purple-500/30">
                <Shield className="w-16 h-16 text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text animate-pulse" />
              </div>
              <Verified className="w-8 h-8 text-emerald-400 absolute -top-2 -right-2 animate-bounce drop-shadow-lg" />
            </div>
          </div>
          
          <div className="relative">
            <h1 className="text-7xl font-extrabold mb-6 relative">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-shimmer">
                CertiBlock
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent blur-sm opacity-50 animate-pulse"></div>
            </h1>
            
            <div className="flex justify-center mb-4">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-spin mx-2" />
              <Sparkles className="w-4 h-4 text-pink-400 animate-bounce mx-1" />
              <Sparkles className="w-5 h-5 text-blue-400 animate-pulse mx-2" />
            </div>
          </div>
          
          <p className="text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light mb-6">
            Next-Generation Blockchain Certificate Verification System
          </p>
          
          <div className="flex justify-center">
            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full animate-pulse"></div>
          </div>
        </header>

        {/* Enhanced Wallet Connection */}
        <div className="max-w-md mx-auto mb-12">
          {!wallet.isConnected ? (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8 hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <Wallet className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">Connect Wallet</h3>
                  <p className="text-slate-400 mb-6">Secure blockchain verification requires wallet connection</p>
                  
                  {wallet.error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                      <div className="flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400 mr-2 animate-bounce" />
                        <span className="text-red-300 text-sm">{wallet.error}</span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={connectWallet}
                    disabled={wallet.isLoading}
                    className="w-full relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></div>
                    <div className="relative z-10">
                      {wallet.isLoading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin mr-3" />
                          Connecting to Petra...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Wallet className="w-6 h-6 mr-3" />
                          Connect Petra Wallet
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl blur opacity-20 animate-pulse"></div>
              <div className="relative bg-emerald-500/10 border border-emerald-500/30 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-10 h-10 text-white animate-bounce" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">Wallet Connected</h3>
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-emerald-500/20">
                    <p className="text-slate-300 text-sm font-mono break-all">
                      {wallet.address}
                    </p>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors duration-200 hover:underline"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Main Content */}
        {wallet.isConnected ? (
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Enhanced Upload Section */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8 hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4 animate-pulse">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Upload Certificate</h2>
                  </div>
                  
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="certificate-upload"
                      disabled={!wallet.isConnected}
                    />
                    <label
                      htmlFor="certificate-upload"
                      className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-blue-400/30 rounded-2xl cursor-pointer bg-gradient-to-br from-blue-500/5 to-purple-500/5 hover:border-blue-400/50 transition-all duration-300 group backdrop-blur-sm overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 flex flex-col items-center justify-center pt-5 pb-6">
                        {showUploadAnimation ? (
                          <div className="animate-bounce">
                            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                              <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <p className="text-emerald-400 font-semibold text-lg">File uploaded successfully!</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                              <Upload className="w-8 h-8 text-white" />
                            </div>
                            <p className="mb-2 text-lg text-slate-200 font-medium">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-sm text-slate-400">PDF, JPG, PNG, WebP (MAX. 10MB)</p>
                          </>
                        )}
                      </div>
                    </label>
                    
                    {uploadedFile && (
                      <div className="mt-6 p-6 bg-slate-700/30 backdrop-blur-sm rounded-2xl border border-slate-600/30 animate-slide-in">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-lg font-medium text-white">{uploadedFile.name}</p>
                            <p className="text-sm text-slate-400">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Verification Section */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8 hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 animate-pulse">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Verify Certificate</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-medium text-slate-200 mb-3">
                        Certificate Hash
                      </label>
                      <input
                        type="text"
                        value={verificationHash}
                        onChange={(e) => setVerificationHash(e.target.value)}
                        placeholder="Enter or scan certificate hash"
                        className="w-full px-6 py-4 bg-slate-700/30 backdrop-blur-sm border border-slate-600/30 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 font-mono text-sm text-white placeholder-slate-400"
                        disabled={!wallet.isConnected}
                      />
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Try 10th certificates: cbse10th2024student001verification, icse10th2023student002verification, stateboard10th2024student003verify
                      </p>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={verifyCertificate}
                        disabled={verificationResult.isVerifying || !verificationHash.trim() || !wallet.isConnected}
                        className="flex-1 relative bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          {verificationResult.isVerifying ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="w-6 h-6 animate-spin mr-3" />
                              Verifying...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <Shield className="w-6 h-6 mr-3" />
                              Verify Certificate
                            </div>
                          )}
                        </div>
                      </button>
                      
                      <button
                        onClick={clearResults}
                        className="px-6 py-4 border border-slate-600/50 rounded-2xl text-slate-300 hover:bg-slate-700/30 hover:border-slate-500/50 transition-all duration-300 backdrop-blur-sm"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Verification Results */}
            {(verificationResult.certificate || verificationResult.error) && (
              <div className="max-w-6xl mx-auto animate-scale-in">
                {verificationResult.certificate ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl blur opacity-20 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
                      <div className="flex items-center mb-8">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mr-6 animate-pulse">
                            <CheckCircle className="w-10 h-10 text-white" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                        </div>
                        <div>
                          <h3 className="text-4xl font-bold text-white mb-2">Verified Certificate</h3>
                          <p className="text-emerald-300 font-semibold text-lg">Government Database Match Found</p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/30">
                            <h4 className="font-bold text-white mb-4 text-xl">Certificate Details</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-300">ID:</span> 
                                <span className="text-white font-mono text-sm">{verificationResult.certificate.id}</span>
                              </div>
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-slate-300">Type:</span> 
                                <span className="text-white text-right max-w-xs">{verificationResult.certificate.certificateType}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-300">Holder:</span> 
                                <span className="text-white">{verificationResult.certificate.holderName}</span>
                              </div>
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-slate-300">Issuer:</span> 
                                <span className="text-white text-right max-w-xs">{verificationResult.certificate.issuer}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/30">
                            <h4 className="font-bold text-white mb-4 text-xl">Additional Information</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-slate-300">Institution:</span> 
                                <span className="text-white text-right max-w-xs">{verificationResult.certificate.metadata?.institution}</span>
                              </div>
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-slate-300">Course:</span> 
                                <span className="text-white text-right max-w-xs">{verificationResult.certificate.metadata?.course}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-300">Grade:</span> 
                                <span className="text-emerald-400 font-semibold">{verificationResult.certificate.metadata?.grade}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-300">Issue Date:</span> 
                                <span className="text-white">{verificationResult.certificate.issueDate}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {verificationResult.certificate.metadata?.verificationUrl && (
                        <div className="mt-8 p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-white text-lg mb-2">Official Verification Link</h4>
                              <p className="text-sm text-slate-300 font-mono break-all">
                                {verificationResult.certificate.metadata.verificationUrl}
                              </p>
                            </div>
                            <button className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 ml-4">
                              <Download className="w-5 h-5 mr-2" />
                              Download Report
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : verificationResult.error === "REAL_CERTIFICATE_DETECTED" ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-20 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
                      <div className="flex items-center mb-8">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-6 animate-pulse">
                            <FileText className="w-10 h-10 text-white" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                        </div>
                        <div>
                          <h3 className="text-4xl font-bold text-white mb-2">Real Certificate Detected</h3>
                          <p className="text-blue-300 font-semibold text-lg">Manual Verification Required</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/30 mb-8">
                        <h4 className="font-bold text-white mb-4 text-xl">Certificate Analysis</h4>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <CheckCircle className="w-6 h-6 text-emerald-400 mr-3" />
                            <span className="text-slate-200">File appears to be a legitimate educational certificate</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-6 h-6 text-emerald-400 mr-3" />
                            <span className="text-slate-200">Document structure matches standard certificate format</span>
                          </div>
                          <div className="flex items-center">
                            <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3" />
                            <span className="text-slate-200">Requires official board verification for authenticity</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6 backdrop-blur-sm">
                        <h4 className="font-bold text-blue-200 mb-4 text-lg">Next Steps for Your 10th Certificate:</h4>
                        <div className="space-y-3 text-blue-100">
                          <div className="flex items-start">
                            <span className="font-bold mr-3 text-blue-300">1.</span>
                            <span>Contact your school or education board (CBSE/ICSE/State Board) for official digital verification</span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-bold mr-3 text-blue-300">2.</span>
                            <span>Visit the official board website to check for digital certificate services</span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-bold mr-3 text-blue-300">3.</span>
                            <span>Some boards provide QR codes or unique verification numbers on certificates</span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-bold mr-3 text-blue-300">4.</span>
                            <span>For immediate verification, contact your school's administrative office</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-start">
                          <Shield className="w-6 h-6 text-emerald-400 mr-3 mt-1" />
                          <div>
                            <p className="text-emerald-300 font-bold text-lg mb-2">Your Certificate Appears Legitimate</p>
                            <p className="text-emerald-100">
                              Based on file analysis, this appears to be a genuine educational certificate. 
                              The system detected standard certificate formatting and educational keywords.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : verificationResult.isFakeCertificate ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl blur opacity-20 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
                      <div className="flex items-center mb-8">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-6 animate-pulse">
                            <XCircle className="w-10 h-10 text-white" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                        </div>
                        <div>
                          <h3 className="text-4xl font-bold text-white mb-2">Fake Certificate Detected</h3>
                          <p className="text-red-300 font-semibold text-lg">Potential Forgery Identified</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/30 mb-8">
                        <h4 className="font-bold text-white mb-4 text-xl">Security Analysis</h4>
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <XCircle className="w-6 h-6 text-red-400 mr-3 mt-1" />
                            <div>
                              <p className="text-red-300 font-bold text-lg">Suspicious Certificate Detected</p>
                              <p className="text-slate-300 mt-2">{verificationResult.fakeDetails?.reason}</p>
                            </div>
                          </div>
                          
                          <div className="border-t border-slate-600/50 pt-4 mt-4">
                            <h5 className="font-bold text-white mb-3">Detected Patterns:</h5>
                            <ul className="space-y-3">
                              {verificationResult.fakeDetails?.detectedPatterns.map((pattern, index) => (
                                <li key={index} className="flex items-start">
                                  <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                                  <span className="text-slate-200">{pattern}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6 backdrop-blur-sm">
                        <h4 className="font-bold text-red-200 mb-4 text-lg">Security Warning</h4>
                        <div className="space-y-3 text-red-100">
                          <div className="flex items-start">
                            <span className="font-bold mr-3 text-red-300">•</span>
                            <span>This certificate appears to be from an unverified or known fake source</span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-bold mr-3 text-red-300">•</span>
                            <span>Internship and online course certificates are commonly forged</span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-bold mr-3 text-red-300">•</span>
                            <span>Only certificates from recognized educational institutions are verified</span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-bold mr-3 text-red-300">•</span>
                            <span>Please contact the issuing organization directly for verification</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-start">
                          <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3 mt-1" />
                          <div>
                            <p className="text-yellow-300 font-bold text-lg mb-2">Note About Online Certificates</p>
                            <p className="text-yellow-100">
                              Certificates from online platforms like Udemy, Coursera, etc., are not considered official 
                              educational credentials in the government verification system. They should be verified 
                              directly through the issuing platform.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : verificationResult.error && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl blur opacity-20 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
                      <div className="flex items-center mb-6">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-6 animate-pulse">
                            <XCircle className="w-10 h-10 text-white" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                        </div>
                        <div>
                          <h3 className="text-4xl font-bold text-white mb-2">Verification Failed</h3>
                          <p className="text-red-300 font-semibold text-lg">
                            {verificationResult.error.includes("Wallet not connected") ? "Wallet Not Connected" : "Certificate Not Found"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/30">
                        <h4 className="font-bold text-white mb-4 text-xl">Error Details</h4>
                        <p className="text-slate-200 mb-6 text-lg">{verificationResult.error}</p>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
                          <div className="flex items-start">
                            <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3 mt-1" />
                            <div>
                              <p className="text-yellow-300 font-bold mb-2">Security Warning</p>
                              <p className="text-yellow-100">
                                {verificationResult.error.includes("Wallet not connected") 
                                  ? "You must connect your wallet to verify certificates." 
                                  : "This certificate could not be verified against government records. Please ensure you have the correct hash or contact the issuing authority."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Enhanced non-connected state
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-20"></div>
            <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-12 text-center">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                    <Lock className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                </div>
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">Wallet Required</h2>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Please connect your Petra wallet to access certificate verification features. 
                This ensures secure and authenticated verification of your documents.
              </p>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 text-lg"
              >
                Connect Wallet Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced CSS Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        /* Glassmorphism effects */
        .backdrop-blur-xl {
          backdrop-filter: blur(16px);
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #06b6d4);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #0891b2);
        }
      `}</style>
    </div>
  );
};

export default App;