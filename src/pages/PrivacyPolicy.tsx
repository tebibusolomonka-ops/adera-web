import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const lastUpdated = 'April 10, 2026';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center px-4 py-4 border-b border-white/10 bg-surface/95 backdrop-blur-md shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white ml-2">Privacy Policy</h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Last Updated: {lastUpdated}</p>
        </div>

        <div className="space-y-8 text-gray-300 text-[15px] leading-relaxed">
          
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              Adera ("we," "our," or "us") operates a digital account marketplace platform (the "Service"). 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
              use our website and mobile application. By accessing or using the Service, you agree to the collection 
              and use of information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            
            <h3 className="text-[16px] font-semibold text-white mt-4 mb-2">2.1 Personal Information</h3>
            <p className="mb-3">When you register and use our Service, we may collect:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Full name and display name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Date of birth / Age</li>
              <li>Profile photograph</li>
              <li>Government-issued identification (for verification purposes)</li>
              <li>Payment information and transaction history</li>
            </ul>

            <h3 className="text-[16px] font-semibold text-white mt-4 mb-2">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>IP address and device identifiers</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Usage data, access times, and pages viewed</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="text-[16px] font-semibold text-white mt-4 mb-2">2.3 Transaction Data</h3>
            <p>
              We collect information related to your transactions on the platform, including but not limited to: 
              items listed, items purchased, transaction amounts, payment screenshots, dispute messages, 
              and credential exchange data.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use the collected information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>To create and manage your account</li>
              <li>To verify your identity and prevent fraud</li>
              <li>To facilitate and process transactions between buyers and sellers</li>
              <li>To provide customer support and resolve disputes</li>
              <li>To send verification emails and important notifications</li>
              <li>To enforce our Terms of Service and platform policies</li>
              <li>To improve and optimize the Service</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Data Sharing and Disclosure</h2>
            <p className="mb-3">We do NOT sell your personal information. We may share your data with:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong className="text-white">Other Users:</strong> Your display name, profile photo, and verification status are visible to other users during transactions.</li>
              <li><strong className="text-white">Service Providers:</strong> Firebase (Google) for authentication, data storage, and hosting.</li>
              <li><strong className="text-white">Law Enforcement:</strong> When required by law, court order, or governmental request.</li>
              <li><strong className="text-white">Dispute Resolution:</strong> Relevant transaction data may be shared between parties during dispute proceedings.</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including encrypted 
              communications (SSL/TLS), secure authentication via Firebase, and strict access controls. 
              However, no method of electronic transmission or storage is 100% secure. While we strive 
              to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to 
              provide the Service. Transaction records are retained for a minimum of 2 years for dispute 
              resolution and legal compliance purposes. You may request deletion of your account data 
              by contacting our support team, subject to legal retention requirements.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to maintain your session, remember your preferences, 
              and analyze usage patterns. You can control cookie preferences through your browser settings. 
              Disabling cookies may affect the functionality of certain features.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Your Rights</h2>
            <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
          </section>

          {/* Children */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Children's Privacy</h2>
            <p>
              The Service is not intended for individuals under the age of 18. We do not knowingly collect 
              personal information from children. If we discover that a child under 18 has provided us 
              with personal information, we will immediately delete such data and terminate the account.
            </p>
          </section>

          {/* Third Party */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Third-Party Services</h2>
            <p>
              Our Service may contain links to third-party websites or integrate with third-party services 
              (including Firebase, Google Analytics, and payment processors). We are not responsible for 
              the privacy practices of these third parties. We encourage you to review their privacy 
              policies independently.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Changes to This Policy</h2>
            <p>
              We reserve the right to update or modify this Privacy Policy at any time. Changes will be 
              effective immediately upon posting on the Service. Your continued use of the Service after 
              changes constitutes acceptance of the updated policy. We will notify you of significant 
              changes via email or in-app notification.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices, 
              please contact us through the in-app Customer Support feature or at{' '}
              <span className="text-[#667eea] font-semibold">support@adera.com</span>.
            </p>
          </section>

          <div className="pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
            <p>© 2026 Adera. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
