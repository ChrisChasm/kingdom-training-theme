/**
 * Footer Component
 * Site footer with navigation and mission statement
 * Includes structured data for Answer Engine Optimization
 */

import { Link } from 'react-router-dom';
import StructuredData from './StructuredData';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Get the current site URL
  const siteUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://ai.kingdom.training';
  
  const logoUrl = `${siteUrl}/wp-content/themes/kingdom-training-theme/dist/kt-logo-header.webp`;

  return (
    <>
      {/* Structured Data for Organization and Website */}
      <StructuredData
        organization={{
          name: 'Kingdom.Training',
          url: siteUrl,
          logo: logoUrl,
          description: 'Training disciple makers to use media to accelerate Disciple Making Movements. Equipping practitioners with practical strategies that bridge online engagement with face-to-face discipleship.',
          sameAs: [
            'https://twitter.com/kingdomtraining',
            // Add other social media profiles as available
          ],
        }}
        website={{
          name: 'Kingdom.Training',
          url: siteUrl,
          description: 'Training disciple makers to use media to accelerate Disciple Making Movements. Equipping practitioners with practical strategies that bridge online engagement with face-to-face discipleship.',
        }}
        faq={{
          questions: [
            {
              question: 'What is Media to Disciple Making Movements (M2DMM)?',
              answer: 'Media to Disciple Making Movements (M2DMM) is a strategic approach that uses targeted media content to identify spiritual seekers online and connect them with face-to-face disciple-makers. It functions like a funnel: introducing masses of people through targeted media content, filtering out disinterested individuals through digital conversations, and ultimately connecting genuine seekers with face-to-face disciplers who help them discover, obey, and share all that Jesus taught.',
            },
            {
              question: 'What is the MVP Strategy Course?',
              answer: 'The MVP (Minimum Viable Product) Strategy Course is our flagship 10-step program that guides you through the core elements needed to craft a Media to Disciple Making Movements strategy for any context. The course helps you develop your complete M2DMM strategy and can be completed in 6-7 hours.',
            },
            {
              question: 'What is Disciple.Tools?',
              answer: 'Disciple.Tools is our free, open-source disciple relationship management system designed specifically for M2DMM practitioners. It helps track and manage disciple-making relationships and movements.',
            },
            {
              question: 'What is the Heavenly Economy?',
              answer: 'The Heavenly Economy is a principle that challenges the broken world\'s teaching that "the more you get, the more you should keep." Instead, we reflect God\'s generous nature by offering free training, hands-on coaching, and open-source tools like Disciple.Tools.',
            },
            {
              question: 'Who is Kingdom.Training for?',
              answer: 'Kingdom.Training is for disciple makers, church planters, missionaries, and ministry leaders who want to use media strategically to accelerate Disciple Making Movements. We particularly focus on equipping those working with unreached and least-reached peoples.',
            },
          ],
        }}
      />
      
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
      
      {/* Key Information Section for LLMs - Hidden visually but accessible to crawlers */}
      <div className="sr-only" aria-hidden="true">
        <h2>Key Definitions</h2>
        <dl>
          <dt>Media to Disciple Making Movements (M2DMM)</dt>
          <dd>A strategic approach that uses targeted media content to identify spiritual seekers online and connect them with face-to-face disciple-makers. The process involves three stages: 1) Media Content - targeted content reaches entire people groups through platforms like Facebook and Google Ads, 2) Digital Filtering - trained responders dialogue with seekers online, identifying persons of peace ready for face-to-face engagement, 3) Face-to-Face Discipleship - multipliers meet seekers in person, guiding them through discovery, obedience, and sharing in reproducing communities.</dd>
          
          <dt>Disciple Making Movements (DMM)</dt>
          <dd>Reproducing communities of disciples who discover, obey, and share all that Jesus taught, resulting in exponential multiplication of disciples and churches.</dd>
          
          <dt>Persons of Peace</dt>
          <dd>Individuals who are open to the gospel message and can serve as bridges to their communities, often identified through initial digital conversations.</dd>
          
          <dt>Heavenly Economy</dt>
          <dd>A principle that challenges the broken world's teaching that "the more you get, the more you should keep." Instead, reflecting God's generous nature by offering free training, hands-on coaching, and open-source tools.</dd>
          
          <dt>Unreached Peoples</dt>
          <dd>People groups where the name of Jesus has never been proclaimed or where there is no indigenous community of believers with adequate numbers and resources to evangelize their own people.</dd>
        </dl>
      </div>
    </footer>
    </>
  );
}

