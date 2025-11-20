/**
 * Footer Component
 * Site footer with navigation and mission statement
 */

import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-900 text-secondary-100">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Mission */}
          <div>
            <div className="mb-4">
              <h2 className="text-white text-2xl font-bold uppercase tracking-wide">
                Kingdom Training
              </h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Training disciple makers to use media to accelerate Disciple Making Movements. 
              Equipping practitioners with practical strategies that bridge online engagement 
              with face-to-face discipleship.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/strategy-courses" className="text-sm hover:text-white transition-colors">
                  Strategy Courses
                </Link>
              </li>
              <li>
                <Link to="/articles" className="text-sm hover:text-white transition-colors">
                  Articles
                </Link>
              </li>
              <li>
                <Link to="/tools" className="text-sm hover:text-white transition-colors">
                  Tools
                </Link>
              </li>
              <li>
                <a href="https://ai.kingdom.training/about/" className="text-sm hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <Link to="/newsletter" className="text-sm hover:text-white transition-colors">
                  Newsletter
                </Link>
              </li>
            </ul>
          </div>

          {/* Mission Scripture */}
          <div>
            <h3 className="text-white font-semibold mb-4">Our Vision</h3>
            <blockquote className="text-sm text-secondary-200 italic leading-relaxed border-l-2 border-primary-500 pl-4">
              &ldquo;Of the sons of Issachar, men who understood the times, with knowledge of what 
              Israel should do.&rdquo;
              <footer className="text-xs text-gray-500 mt-2">— 1 Chronicles 12:32</footer>
            </blockquote>
            <p className="text-sm text-gray-400 leading-relaxed mt-4">
              We wonder what the Church could accomplish with technology God has given to this 
              generation for the first time in history.
            </p>
          </div>
        </div>

        <div className="border-t border-secondary-800 mt-8 pt-8">
          <div className="text-center mb-6">
            <Link
              to="/newsletter"
              className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
            >
              Subscribe to Newsletter
            </Link>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
            <a 
              href="https://ai.kingdom.training/about/" 
              className="text-sm text-secondary-200 hover:text-white transition-colors"
            >
              About
            </a>
            <span className="hidden md:inline text-secondary-600">|</span>
            <a 
              href="https://ai.kingdom.training/privacy-policy/" 
              className="text-sm text-secondary-200 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
          </div>
          <p className="text-sm text-secondary-200 text-center">
            &copy; {currentYear} Kingdom.Training. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

