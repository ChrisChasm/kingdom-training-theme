import PageHeader from '@/components/PageHeader';
import SEO from '@/components/SEO';

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();
  
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Privacy Policy for Kingdom.Training. Learn how we collect, use, and protect your personal information when you use our website and services."
        keywords="privacy policy, data protection, personal information, GDPR, privacy rights, Kingdom Training privacy"
        url="/privacy"
      />
      <PageHeader 
        title="Privacy Policy"
        description="How we collect, use, and protect your information"
      />

      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Kingdom.Training (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our 
                website and use our services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our website, you consent to the data practices described in this policy. If you do not agree with 
                the practices described in this policy, please do not use our website.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Subscribe to our newsletter</li>
                <li>Register for courses or training</li>
                <li>Contact us through our website</li>
                <li>Participate in surveys or feedback forms</li>
                <li>Create an account or profile</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                This information may include:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Name and contact information (email address, phone number)</li>
                <li>Mailing address</li>
                <li>Organization or ministry affiliation</li>
                <li>Any other information you choose to provide</li>
              </ul>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Automatically Collected Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you visit our website, we may automatically collect certain information about your device and usage, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website addresses</li>
                <li>Date and time of access</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>To provide, maintain, and improve our services</li>
                <li>To send you newsletters, updates, and communications about our training resources</li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>To process registrations and manage your account</li>
                <li>To analyze website usage and trends to improve user experience</li>
                <li>To detect, prevent, and address technical issues and security threats</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information 
                only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers 
                who assist us in operating our website, conducting our business, or serving our users, as long as they agree 
                to keep this information confidential.</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response 
                to valid requests by public authorities.</li>
                <li><strong>Protection of Rights:</strong> We may share information when we believe release is appropriate 
                to protect our rights, property, or safety, or that of our users or others.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your 
                information may be transferred as part of that transaction.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over 
                the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our website and store certain information. 
                Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct 
                your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept 
                cookies, you may not be able to use some portions of our website.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our website may contain links to third-party websites that are not operated by us. We have no control over 
                and assume no responsibility for the content, privacy policies, or practices of any third-party websites. 
                We encourage you to review the privacy policy of every site you visit.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Access:</strong> The right to request access to your personal information</li>
                <li><strong>Correction:</strong> The right to request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> The right to request deletion of your personal information</li>
                <li><strong>Objection:</strong> The right to object to processing of your personal information</li>
                <li><strong>Data Portability:</strong> The right to request transfer of your data to another service</li>
                <li><strong>Withdraw Consent:</strong> The right to withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To exercise these rights, please contact us using the information provided in the &ldquo;Contact Us&rdquo; section below.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Children&apos;s Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our website is not intended for children under the age of 13. We do not knowingly collect personal information 
                from children under 13. If you are a parent or guardian and believe your child has provided us with personal 
                information, please contact us, and we will delete such information from our systems.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date. You are advised to review this 
                Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="mb-12 bg-primary-50 p-6 rounded-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Kingdom.Training</strong><br />
                Email: <a href="mailto:info@kingdom.training" className="text-primary-600 hover:text-primary-700 underline">info@kingdom.training</a><br />
                Website: <a href="https://ai.kingdom.training" className="text-primary-600 hover:text-primary-700 underline">ai.kingdom.training</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

