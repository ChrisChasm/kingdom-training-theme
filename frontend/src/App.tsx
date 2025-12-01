import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import StrategyCoursesPage from './pages/StrategyCoursesPage';
import StrategyCourseDetailPage from './pages/StrategyCourseDetailPage';
import ToolsPage from './pages/ToolsPage';
import ToolDetailPage from './pages/ToolDetailPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import NewsletterPage from './pages/NewsletterPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-grow pt-20">
        <Routes>
          {/* Routes with optional language prefix */}
          <Route path="/" element={<HomePage />} />
          <Route path="/:lang" element={<HomePage />} />
          
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/:lang/articles" element={<ArticlesPage />} />
          <Route path="/articles/:slug" element={<ArticleDetailPage />} />
          <Route path="/:lang/articles/:slug" element={<ArticleDetailPage />} />
          
          <Route path="/strategy-courses" element={<StrategyCoursesPage />} />
          <Route path="/:lang/strategy-courses" element={<StrategyCoursesPage />} />
          <Route path="/strategy-courses/:slug" element={<StrategyCourseDetailPage />} />
          <Route path="/:lang/strategy-courses/:slug" element={<StrategyCourseDetailPage />} />
          
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/:lang/tools" element={<ToolsPage />} />
          <Route path="/tools/:slug" element={<ToolDetailPage />} />
          <Route path="/:lang/tools/:slug" element={<ToolDetailPage />} />
          
          <Route path="/about" element={<AboutPage />} />
          <Route path="/:lang/about" element={<AboutPage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/:lang/login" element={<LoginPage />} />
          
          <Route path="/newsletter" element={<NewsletterPage />} />
          <Route path="/:lang/newsletter" element={<NewsletterPage />} />
          
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/:lang/privacy" element={<PrivacyPage />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

