import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Contact Form Privacy Notice</h1>
          
          <p className="mb-4"><strong>Effective Date: 10-08-2024</strong></p>

          <p className="mb-4">
            This Contact Form Privacy Notice explains how we collect, use, and protect the personal information you provide when using our contact form. By submitting information through this form, you agree to the practices described in this notice.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
          <p className="mb-4">When you use our contact form, we collect the following personal information:</p>
          <ul className="list-disc list-inside mb-4">
            <li>First name</li>
            <li>Last name</li>
            <li>Email address</li>
            <li>Phone number (optional)</li>
            <li>Organization (optional)</li>
            <li>Message content</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the information you provide through the contact form for the following purposes:</p>
          <ul className="list-disc list-inside mb-4">
            <li>To respond to your inquiries or requests</li>
            <li>To provide you with information about our services</li>
            <li>To improve our customer service and user experience</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">3. Data Retention</h2>
          <p className="mb-4">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this notice, unless a longer retention period is required or permitted by law.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">4. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">5. Sharing Your Information</h2>
          <p className="mb-4">
            We do not sell, trade, or otherwise transfer your personal information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, as long as those parties agree to keep this information confidential.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">6. Your Rights</h2>
          <p className="mb-4">Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="list-disc list-inside mb-4">
            <li>The right to access the personal information we hold about you</li>
            <li>The right to request correction of inaccurate information</li>
            <li>The right to request deletion of your information</li>
            <li>The right to object to or restrict certain processing of your information</li>
          </ul>
          <p className="mb-4">
            To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">7. Changes to This Notice</h2>
          <p className="mb-4">
            We may update this Contact Form Privacy Notice from time to time. We will notify you of any changes by posting the new notice on this page and updating the "Effective Date" at the top.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">8. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Contact Form Privacy Notice, please contact us at:
          </p>
          <p className="mb-4">
            Civita<br />
            133 Bethnal Green Road, E2 7DG<br />
            Email: contact@civita.co.uk
          </p>

        </div>
      </main>

      <Footer />
    </div>
  )
}