import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PlaceholderPage = ({
  title,
  subtitle,
  description,
  icon: Icon,
  showCta = true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/30">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            {Icon && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
                <Icon className="w-4 h-4" />
                {subtitle || 'COMING SOON'}
              </div>
            )}

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {title}
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {description}
            </p>
          </div>

          {/* Coming Soon Content */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 border border-gray-200 dark:border-gray-700 shadow-xl max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
                <div className="text-4xl">🚧</div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Page Under Construction
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                We're working hard to bring you this content. This page will be available soon with comprehensive information and resources.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">✓</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">In Progress</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Content being developed</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">✓</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quality Check</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Ensuring accuracy</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">✓</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Launch Prep</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Final testing phase</p>
                </div>
              </div>

              {showCta && (
                <div className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    In the meantime, check out our available pages or contact us for more information.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/contact"
                      className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
                    >
                      Contact Support
                    </a>
                    <a
                      href="/"
                      className="inline-flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium"
                    >
                      Return Home
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="max-w-2xl mx-auto mt-12">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">75%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                style={{ width: '75%' }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              Estimated launch: 2-3 weeks
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlaceholderPage;
