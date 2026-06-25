import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  HelpCircle,
  BookOpen,
  Video,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  User,
  CreditCard,
  Settings,
  Bell,
  Shield,
  Database,
  Download,
  Upload,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Headphones,
  Globe,
  Lock,
  RefreshCw,
  BarChart3,
  PieChart,
  Home,
  Sparkles,
  Zap,
  Award,
  Target,
  Activity
} from "lucide-react";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Comprehensive FAQs organized by category
  const faqCategories = [
    { id: "getting-started", name: "Getting Started", icon: <Sparkles className="w-5 h-5" /> },
    { id: "debtors", name: "Debtor Management", icon: <Users className="w-5 h-5" /> },
    { id: "payments", name: "Payments", icon: <CreditCard className="w-5 h-5" /> },
    { id: "reports", name: "Reports & Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "settings", name: "Settings & Preferences", icon: <Settings className="w-5 h-5" /> },
    { id: "troubleshooting", name: "Troubleshooting", icon: <AlertTriangle className="w-5 h-5" /> },
  ];

  const faqs = [
    // Getting Started
    {
      id: 1,
      question: "How do I get started with the Debt Collection System?",
      answer: "Welcome to DCS! Start by exploring your Dashboard for an overview. Add your first debtor via the 'Add Debtor' button, set up your notification preferences in Settings, and check out the Reports section for analytics. We recommend watching our onboarding video for a quick start.",
      category: "getting-started",
      related: ["dashboard", "debtors"],
      readTime: "2 min"
    },
    {
      id: 2,
      question: "What are the key features I should know about?",
      answer: "Key features include: 1) Real-time Dashboard with financial insights, 2) Debtor Management with detailed profiles, 3) Payment Tracking and history, 4) Automated Notifications for overdue debts, 5) Advanced Reporting with export capabilities, 6) Customizable Settings for your preferences.",
      category: "getting-started",
      related: ["features", "overview"],
      readTime: "3 min"
    },

    // Debtor Management
    {
      id: 3,
      question: "How do I add a new debtor?",
      answer: "Navigate to 'Debtors' in the sidebar → Click 'Add New Debtor' button → Fill in the required information (name, contact, debt amount) → Add additional details like payment terms and notes → Click 'Save'. The debtor will immediately appear in your list and dashboard.",
      category: "debtors",
      related: ["add", "create"],
      readTime: "1 min"
    },
    {
      id: 4,
      question: "How do I edit or update debtor information?",
      answer: "Go to 'Debtors' → Click on the debtor you want to edit → Click the 'Edit' button in the top right → Make your changes → Click 'Save'. All changes are synced immediately across the system.",
      category: "debtors",
      related: ["edit", "update"],
      readTime: "1 min"
    },
    {
      id: 5,
      question: "Why can't I see my debtor in the list?",
      answer: "Check the following: 1) Ensure you're not using a filter that hides the debtor, 2) Refresh the page (data syncs every 5 minutes), 3) Verify backend API connection in System Status, 4) Check if the debtor was archived. If issues persist, contact support.",
      category: "debtors",
      related: ["missing", "filter"],
      readTime: "2 min"
    },

    // Payments
    {
      id: 6,
      question: "How do I record a payment from a debtor?",
      answer: "Go to the debtor's profile → Click 'Record Payment' → Enter payment amount and date → Select payment method (cash, bank transfer, mobile money) → Add reference/notes → Click 'Confirm'. The payment will be reflected in your dashboard instantly.",
      category: "payments",
      related: ["record", "receipt"],
      readTime: "2 min"
    },
    {
      id: 7,
      question: "How does the system handle overdue payments?",
      answer: "Overdue payments are automatically detected and highlighted in red. You'll receive notifications (based on your settings) and the dashboard will show overdue counts. You can filter debtors by overdue status and set up automated reminder emails.",
      category: "payments",
      related: ["overdue", "late"],
      readTime: "2 min"
    },

    // Reports & Analytics
    {
      id: 8,
      question: "How do I generate financial reports?",
      answer: "Navigate to 'Reports' → Select report type (Collection Report, Debtor Summary, Payment History) → Choose date range → Click 'Generate Report'. Reports can be exported as PDF, Excel, or CSV. You can also schedule automatic weekly reports.",
      category: "reports",
      related: ["export", "analytics"],
      readTime: "3 min"
    },
    {
      id: 9,
      question: "What analytics are available on the dashboard?",
      answer: "The dashboard shows: 1) Total outstanding balance, 2) Recovery rate percentage, 3) Active vs overdue debts, 4) Payment trends (last 7 days), 5) Debtor distribution by status, 6) Top debtors by balance, 7) System performance metrics.",
      category: "reports",
      related: ["dashboard", "metrics"],
      readTime: "2 min"
    },

    // Settings
    {
      id: 10,
      question: "How do I customize notification preferences?",
      answer: "Go to 'Settings' → 'Notifications & Alerts' section → Toggle notification types (email, SMS, push) → Set alert thresholds → Configure quiet hours if needed → Save changes. Notifications are sent for: new debtors, overdue payments, successful collections, and system updates.",
      category: "settings",
      related: ["notifications", "alerts"],
      readTime: "2 min"
    },
    {
      id: 11,
      question: "How do I change my account password?",
      answer: "Navigate to 'Settings' → 'Security & Privacy' → Click 'Change Password' → Enter current and new passwords → Confirm changes. For security, you'll be logged out of other sessions. Enable two-factor authentication for extra security.",
      category: "settings",
      related: ["security", "password"],
      readTime: "1 min"
    },

    // Troubleshooting
    {
      id: 12,
      question: "The dashboard isn't showing real-time data. What should I do?",
      answer: "Try these steps: 1) Click the 'Refresh' button in the top right, 2) Check your internet connection, 3) Verify API status in System Settings, 4) Clear browser cache, 5) Ensure auto-refresh is enabled in settings. If the issue persists, contact support.",
      category: "troubleshooting",
      related: ["loading", "data"],
      readTime: "2 min"
    },
    {
      id: 13,
      question: "I'm experiencing slow performance. How can I improve it?",
      answer: "Performance tips: 1) Use filters to reduce data load, 2) Close unnecessary browser tabs, 3) Clear browser cache regularly, 4) Update to latest browser version, 5) Check internet speed. For large datasets, consider archiving old records.",
      category: "troubleshooting",
      related: ["slow", "performance"],
      readTime: "2 min"
    },
  ];

  // Popular topics
  const popularTopics = [
    { title: "Quick Start Guide", description: "Get up and running in 10 minutes", icon: <Zap className="w-5 h-5" />, link: "#" },
    { title: "Payment Processing", description: "Complete guide to recording payments", icon: <DollarSign className="w-5 h-5" />, link: "#" },
    { title: "Report Generation", description: "Create and export detailed reports", icon: <FileText className="w-5 h-5" />, link: "#" },
    { title: "Security Best Practices", description: "Keep your data safe", icon: <Shield className="w-5 h-5" />, link: "#" },
    { title: "System Integration", description: "Connect with external tools", icon: <Globe className="w-5 h-5" />, link: "#" },
    { title: "Mobile Access", description: "Use DCS on your phone", icon: <Phone className="w-5 h-5" />, link: "#" },
  ];

  // Contact options
  const contactOptions = [
    { type: "Email", value: "support@dcs.app", icon: <Mail className="w-5 h-5" />, response: "Within 2 hours" },
    { type: "Phone", value: "+254 700 000 000", icon: <Phone className="w-5 h-5" />, response: "24/7 Support" },
    { type: "Live Chat", value: "Chat Now", icon: <MessageSquare className="w-5 h-5" />, response: "Instant" },
    { type: "Help Desk", value: "Help Desk Portal", icon: <Headphones className="w-5 h-5" />, response: "Ticket System" },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.related.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  useEffect(() => {
    // Simulate loading state
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Help Center</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Knowledge Base & Support
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/dashboard/settings"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 font-medium text-sm"
            >
              <Settings className="w-4 h-4" />
              Back to Settings
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
                    <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      How can we help you today?
                    </h1>
                    <p className="text-blue-100 text-base">
                      Find answers, guides, and tutorials for Debt Collection System
                    </p>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mt-6 max-w-2xl">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for answers, guides, or topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-10 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-blue-200 rounded-xl focus:ring-2 focus:ring-white focus:border-white transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs text-blue-200">Popular searches:</span>
                    {["payments", "debtors", "reports", "notifications", "settings"].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl min-w-[250px]">
                <h3 className="font-semibold mb-4">Help Center Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-200">Articles</span>
                    <span className="font-bold">{faqs.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-200">Categories</span>
                    <span className="font-bold">{faqCategories.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-200">Avg. Response Time</span>
                    <span className="font-bold">2 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-200">Support Satisfaction</span>
                    <span className="font-bold">98%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories & Popular Topics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Categories */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Browse by Category</h2>
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {faqCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                        activeCategory === category.id
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800"
                          : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <div className={`p-3 rounded-lg ${
                        activeCategory === category.id
                          ? "bg-blue-100 dark:bg-blue-900/50"
                          : "bg-gray-100 dark:bg-gray-600"
                      }`}>
                        {category.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {faqs.filter(f => f.category === category.id).length} articles
                        </p>
                      </div>
                    </button>
                  ))}

                  {/* All Categories */}
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                      activeCategory === "all"
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800"
                        : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${
                      activeCategory === "all"
                        ? "bg-blue-100 dark:bg-blue-900/50"
                        : "bg-gray-100 dark:bg-gray-600"
                    }`}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">All Categories</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{faqs.length} articles</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Popular Topics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Popular Topics</h2>
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="space-y-3">
                {popularTopics.map((topic, index) => (
                  <Link
                    key={index}
                    to={topic.link}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors group"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-105 transition-transform">
                      {topic.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {topic.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{topic.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                  </Link>
                ))}
              </div>

              {/* Quick Links */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link to="/dashboard" className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    <Home className="w-4 h-4" />
                    Return to Dashboard
                  </Link>
                  <Link to="/dashboard/settings" className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    <Settings className="w-4 h-4" />
                    System Settings
                  </Link>
                  <Link to="/dashboard/notifications" className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    <Bell className="w-4 h-4" />
                    Notification Center
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {filteredFaqs.length} questions found {searchQuery && `for "${searchQuery}"`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeCategory !== "all" && (
                  <button
                    onClick={() => setActiveCategory("all")}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear filter
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  We couldn't find any articles matching "{searchQuery}". Try different keywords or browse by category.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`border rounded-xl transition-all duration-300 ${
                      expandedFaq === faq.id
                        ? "border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-start justify-between p-6 text-left"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            faq.category === "troubleshooting" ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                            faq.category === "getting-started" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                            "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          }`}>
                            {faqCategories.find(c => c.id === faq.category)?.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {faq.readTime} read
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                          {faq.question}
                        </h3>
                        {expandedFaq === faq.id ? null : (
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                            {faq.answer.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                          expandedFaq === faq.id ? "rotate-90" : ""
                        }`} />
                      </div>
                    </button>

                    {expandedFaq === faq.id && (
                      <div className="px-6 pb-6 animate-fade-in">
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-gray-700 dark:text-gray-300 mb-4">{faq.answer}</p>

                          <div className="flex items-center gap-4 pt-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Related topics:</span>
                            <div className="flex flex-wrap gap-2">
                              {faq.related.map((tag, index) => (
                                <button
                                  key={index}
                                  onClick={() => setSearchQuery(tag)}
                                  className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6 flex items-center gap-4">
                            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Was this helpful?
                              </span>
                            </button>
                            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" />
                                Report issue
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact & Support */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Contact Options */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
                  <Headphones className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact Support</h2>
                  <p className="text-gray-500 dark:text-gray-400">Get help from our support team</p>
                </div>
              </div>

              <div className="space-y-4">
                {contactOptions.map((option, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        {option.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{option.type}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{option.value}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Response time</p>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">{option.response}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Resources */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                  <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Additional Resources</h2>
                  <p className="text-gray-500 dark:text-gray-400">Learn more with our resources</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Video Tutorials</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Watch step-by-step guides for all features
                      </p>
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                        Browse Tutorials →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Documentation</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Complete technical documentation and API guides
                      </p>
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                        Read Documentation →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Community Forum</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Connect with other users and share solutions
                      </p>
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                        Join Community →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Status</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400">All systems operational</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">API Status</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Connected & healthy</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Database</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last sync: 2 min ago</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Uptime</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">99.9% this month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
