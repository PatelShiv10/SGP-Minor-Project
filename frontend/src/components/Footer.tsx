import { Link } from 'react-router-dom';
export const Footer = () => {
  return <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-teal transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-teal transition-colors">About</Link></li>
              <li><Link to="/chatbot" className="text-gray-300 hover:text-teal transition-colors">Chatbot</Link></li>
              <li><Link to="/find-lawyer" className="text-gray-300 hover:text-teal transition-colors">Find a Lawyer</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/lawsimplify" className="text-gray-300 hover:text-teal transition-colors">LawSimplify</Link></li>
              <li><Link to="/document-qa" className="text-gray-300 hover:text-teal transition-colors">Document Q&A</Link></li>
              <li><span className="text-gray-300">Legal Consultation</span></li>
              <li><span className="text-gray-300">Document Review</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-gray-300 hover:text-teal transition-colors">Contact Us</Link></li>
              <li><span className="text-gray-300">support@lawmate.com</span></li>
              <li><span className="text-gray-300">1-800-LEGAL-AI</span></li>
            </ul>
          </div>

          {/* Social & Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-300 hover:text-teal transition-colors">LinkedIn</a>
              <a href="#" className="text-gray-300 hover:text-teal transition-colors">GitHub</a>
            </div>
            <p className="text-sm text-gray-400">© 2025 LawMate. All rights reserved.</p>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <p className="text-sm text-gray-400 text-center">
            <strong>Legal Disclaimer:</strong> This platform provides general legal information and AI-assisted guidance. 
            It does not constitute legal advice. Always consult with a qualified attorney for specific legal matters.
          </p>
        </div>
      </div>
    </footer>;
};