import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();
  const lastUpdated = 'April 10, 2026';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center px-4 py-4 border-b border-white/10 bg-surface/95 backdrop-blur-md shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white ml-2">Terms of Service</h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-400 text-sm">Last Updated: {lastUpdated}</p>
        </div>

        <div className="space-y-8 text-gray-300 text-[15px] leading-relaxed">

          {/* Acceptance */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing, registering on, or using Adera ("the Platform," "we," "our," or "us"), you agree to be 
              bound by these Terms of Service ("Terms"), our Privacy Policy, and all applicable laws and regulations. 
              If you do not agree with any of these Terms, you are prohibited from using the Platform. These Terms 
              constitute a legally binding agreement between you and Adera.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Eligibility</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>You must be at least <strong className="text-white">18 years of age</strong> to use the Platform.</li>
              <li>You must provide accurate, complete, and current registration information.</li>
              <li>You must complete identity verification to access all Platform features.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>One person may only operate one account. Multiple accounts are strictly prohibited.</li>
            </ul>
          </section>

          {/* Platform Description */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Platform Description</h2>
            <p>
              Adera is a peer-to-peer digital account marketplace that facilitates the buying and selling of 
              digital accounts between users. The Platform acts solely as an intermediary and escrow service 
              to connect buyers and sellers. Adera does NOT own, create, or guarantee the quality, 
              functionality, or value of any accounts listed on the Platform.
            </p>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. User Responsibilities</h2>
            
            <h3 className="text-[16px] font-semibold text-white mt-4 mb-2">4.1 Sellers Must:</h3>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Provide accurate and truthful descriptions of all listed accounts</li>
              <li>Ensure they have full ownership and authority to sell listed accounts</li>
              <li>Deliver account credentials promptly upon confirmed payment</li>
              <li>Not sell stolen, hacked, or fraudulently obtained accounts</li>
              <li>Not list accounts that violate the original platform's Terms of Service</li>
              <li>Provide all necessary credentials and access instructions as described in the listing</li>
            </ul>

            <h3 className="text-[16px] font-semibold text-white mt-4 mb-2">4.2 Buyers Must:</h3>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Verify account details before confirming receipt</li>
              <li>Complete payment through the Platform's designated payment methods only</li>
              <li>Not attempt to bypass the Platform's escrow system</li>
              <li>Report any discrepancies within the designated dispute period</li>
              <li>Immediately change all passwords and security settings upon receiving account credentials</li>
              <li>Accept full responsibility for the account after confirming receipt and completing the transaction</li>
            </ul>
          </section>

          {/* Transactions */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Transactions and Payments</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>All transactions must be conducted through the Platform's official payment and escrow system.</li>
              <li>Off-platform transactions are strictly prohibited and will result in immediate account termination.</li>
              <li>Payment verification is required before account credentials are released to the buyer.</li>
              <li>Sellers receive payment only after the buyer confirms successful receipt of account credentials.</li>
              <li>The Platform charges a mandatory 7% platform fee added to the seller's asking price. This will be explicitly seen upon listing and at checkout.</li>
              <li>All payments are final once a transaction is marked as completed by both parties.</li>
            </ul>
          </section>

          {/* LIABILITY LIMITATION - KEY SECTION */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Limitation of Liability & Disclaimer</h2>

            <div className="bg-[#E53E3E]/10 border border-[#E53E3E]/20 rounded-xl p-4 mb-4">
              <p className="text-[#FEB2B2] font-semibold text-[14px]">⚠️ IMPORTANT — PLEASE READ CAREFULLY</p>
            </div>
            
            <h3 className="text-[16px] font-semibold text-white mt-4 mb-2">6.1 Post-Transaction Liability</h3>
            <p className="mb-3">
              <strong className="text-white">Once a transaction is marked as "Completed" and both parties have confirmed the exchange, 
              Adera bears NO responsibility or liability for:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Any loss of access to the purchased account after completion</li>
              <li>The account being recovered, banned, or suspended by the original platform</li>
              <li>Changes to the account's value, status, features, or content after transfer</li>
              <li>Any disputes between the buyer and the original platform or service provider</li>
              <li>Unauthorized access or hacking of the account after transfer</li>
              <li>Failure of the buyer to secure the account (change passwords, enable 2FA, etc.)</li>
              <li>Any financial, reputational, or consequential damages arising from account usage</li>
            </ul>

            <h3 className="text-[16px] font-semibold text-white mt-4 mb-2">6.2 Platform Liability</h3>
            <p className="mb-3">
              The Platform is provided on an "AS IS" and "AS AVAILABLE" basis. To the fullest extent permitted by law:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>We make <strong className="text-white">NO warranties or guarantees</strong> about the quality, authenticity, or longevity of any accounts traded.</li>
              <li>We are <strong className="text-white">NOT responsible</strong> for the actions, products, or content of our users.</li>
              <li>We do <strong className="text-white">NOT guarantee</strong> that the Platform will be uninterrupted, timely, secure, or error-free.</li>
              <li>Our total liability shall not exceed the amount of fees paid by you to the Platform in the last 12 months.</li>
              <li>We are <strong className="text-white">NOT liable</strong> for indirect, incidental, special, consequential, or punitive damages.</li>
            </ul>

            <h3 className="text-[16px] font-semibold text-white mt-4 mb-2">6.3 Indemnification</h3>
            <p>
              You agree to indemnify, defend, and hold harmless Adera, its officers, directors, employees, and agents 
              from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of or 
              related to your use of the Platform, your violation of these Terms, or your violation of any rights of 
              a third party.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Disputes and Resolution</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Disputes must be filed <strong className="text-white">within the active transaction window</strong> (before confirming receipt).</li>
              <li>Once a transaction is completed and confirmed, disputes cannot be opened.</li>
              <li>Our admin team will review disputes and make a binding decision based on evidence provided by both parties.</li>
              <li>Dispute decisions are final and not subject to appeal.</li>
              <li>Abuse of the dispute system (false claims, repeated frivolous disputes) will result in account suspension or permanent ban.</li>
              <li>Both parties must cooperate in good faith during the dispute resolution process.</li>
            </ul>
          </section>

          {/* Prohibited Activities */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Prohibited Activities</h2>
            <p className="mb-3">The following activities are strictly prohibited and will result in immediate account termination:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Selling or buying stolen, hacked, or fraudulently obtained accounts</li>
              <li>Creating multiple accounts or using fake identities</li>
              <li>Attempting to bypass the escrow or payment verification system</li>
              <li>Conducting transactions outside the Platform</li>
              <li>Harassing, threatening, or intimidating other users</li>
              <li>Uploading malicious content, viruses, or harmful code</li>
              <li>Listing accounts involving illegal activities, adult content, or prohibited materials</li>
              <li>Manipulating reviews, ratings, or feedback</li>
              <li>Using bots, scrapers, or automated tools to access the Platform</li>
              <li>Money laundering, terrorist financing, or any other financial crime</li>
              <li>Impersonating another user, person, or entity</li>
              <li>Interfering with the Platform's infrastructure or security measures</li>
              <li>Attempting to recover or reclaim an account after selling it</li>
            </ul>
          </section>

          {/* Account Security */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Account Security</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>You are solely responsible for maintaining the security of your Adera account.</li>
              <li>You must immediately notify us of any unauthorized access or security breach.</li>
              <li>We are not liable for any loss or damage arising from your failure to secure your account.</li>
              <li>Identity verification (KYC) is required for selling and accessing certain features.</li>
              <li>Verified identity information (name, age) cannot be changed once approved to prevent fraud.</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Intellectual Property</h2>
            <p>
              All content, trademarks, logos, and intellectual property displayed on the Platform are the 
              property of Adera or its licensors. You may not copy, reproduce, distribute, or create 
              derivative works from any Platform content without prior written consent. User-generated 
              content (listings, reviews) remains the property of the respective users, but by posting 
              on the Platform, you grant Adera a non-exclusive, royalty-free, worldwide license to use, 
              display, and distribute such content in connection with the Service.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Account Termination</h2>
            <p className="mb-3">We reserve the right to suspend or permanently terminate your account at our sole discretion if:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>You violate any of these Terms</li>
              <li>You engage in fraudulent or suspicious activity</li>
              <li>Multiple disputes are filed against you</li>
              <li>You fail to complete identity verification when required</li>
              <li>Your account poses a risk to other users or the Platform</li>
              <li>Required by law or legal process</li>
            </ul>
            <p className="mt-3">
              Upon termination, you lose access to all Platform features. Any pending transactions may be 
              cancelled and funds returned to the appropriate party. Termination does not release you from 
              obligations incurred prior to termination.
            </p>
          </section>

          {/* Assumption of Risk */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Assumption of Risk</h2>
            <p>
              By using the Platform, you acknowledge and accept that trading digital accounts carries inherent risks, 
              including but not limited to: account recovery by original owners, platform bans, loss of account value, 
              and potential violation of third-party terms of service. <strong className="text-white">You assume all risks 
              associated with buying and selling digital accounts on the Platform.</strong> Adera serves solely as a 
              facilitator and escrow service and does not guarantee the outcome of any transaction.
            </p>
          </section>

          {/* Communication */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Communications</h2>
            <p>
              By creating an account, you consent to receive electronic communications from us, including 
              emails, push notifications, and in-app messages regarding your account, transactions, security 
              alerts, and service updates. You may opt out of promotional communications at any time through 
              your account settings, but transactional and security-related communications cannot be opted out of.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">14. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
              in which Adera operates, without regard to conflict of law provisions. Any disputes arising 
              from these Terms or the use of the Platform shall be resolved through binding arbitration 
              or in the courts of competent jurisdiction.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">15. Severability</h2>
            <p>
              If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court 
              of competent jurisdiction, such provision shall be modified to the minimum extent necessary to 
              make it valid and enforceable, and the remaining provisions shall continue in full force and effect.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">16. Changes to Terms</h2>
            <p>
              Adera reserves the right to modify these Terms at any time. Changes will be posted on the Platform 
              and become effective immediately. Your continued use of the Platform after changes constitutes 
              acceptance of the revised Terms. We encourage you to review these Terms periodically. For 
              significant changes, we will provide notice via email or in-app notification.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">17. Contact Information</h2>
            <p>
              For questions, concerns, or complaints regarding these Terms, please contact us through the 
              in-app Customer Support feature or at{' '}
              <span className="text-[#667eea] font-semibold">support@adera.com</span>.
            </p>
          </section>

          {/* Acknowledgement */}
          <section className="bg-surface border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-3">Acknowledgement</h2>
            <p>
              By creating an account on Adera, you acknowledge that you have read, understood, and agree 
              to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these 
              Terms, you must not use the Platform.
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

export default TermsOfService;
