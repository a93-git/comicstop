import { Navbar } from '../Navbar/Navbar'
import styles from './Terms.module.css'

export function Terms() {
  return (
    <div className={styles.container}>
      <Navbar />
      
      <div className={styles.content}>
        <div className={styles.wrapper}>
          <h1 className={styles.title}>Terms and Conditions</h1>
          <p className={styles.lastUpdated}>Last updated: September 12, 2025</p>
          
          <div className={styles.section}>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using ComicStop, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </div>

          <div className={styles.section}>
            <h2>2. Service Description</h2>
            <p>
              ComicStop is a digital platform for reading, sharing, and managing comic book 
              collections. Our service allows users to upload, organize, and read PDF comic 
              books in a digital format.
            </p>
          </div>

          <div className={styles.section}>
            <h2>3. User Account and Registration</h2>
            <p>
              To access certain features of our service, you must register for an account. 
              You are responsible for maintaining the confidentiality of your account 
              credentials and for all activities that occur under your account.
            </p>
            <ul>
              <li>You must provide accurate and complete information during registration</li>
              <li>You must be at least 13 years old to create an account</li>
              <li>You are responsible for keeping your password secure</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>4. Content and Copyright</h2>
            <p>
              Users are responsible for ensuring they have the right to upload and share 
              any content on our platform. ComicStop respects intellectual property rights 
              and expects users to do the same.
            </p>
            <ul>
              <li>Do not upload copyrighted material without permission</li>
              <li>We reserve the right to remove content that violates copyright</li>
              <li>Users retain ownership of their uploaded content</li>
              <li>By uploading content, you grant us a license to display and distribute it through our service</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>5. Payment and Subscription</h2>
            <p>
              ComicStop offers both free and premium features. Premium features require 
              a paid subscription. All payments are processed securely through our 
              payment partners.
            </p>
            <ul>
              <li>Subscription fees are billed in advance</li>
              <li>Refunds are available within 14 days of purchase</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
              <li>Your subscription will auto-renew unless cancelled</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>6. Privacy and Data Protection</h2>
            <p>
              We are committed to protecting your privacy. Our Privacy Policy describes 
              how we collect, use, and protect your personal information.
            </p>
            <ul>
              <li>We collect only necessary information to provide our service</li>
              <li>We do not sell your personal data to third parties</li>
              <li>We use industry-standard security measures to protect your data</li>
              <li>You can request deletion of your account and data at any time</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>7. Prohibited Activities</h2>
            <p>
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul>
              <li>Violating any applicable laws or regulations</li>
              <li>Uploading malicious software or harmful content</li>
              <li>Attempting to gain unauthorized access to our systems</li>
              <li>Harassing or threatening other users</li>
              <li>Spamming or sending unsolicited communications</li>
              <li>Using automated tools to access our service</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>8. Limitation of Liability</h2>
            <p>
              ComicStop provides the service "as is" without warranties of any kind. 
              We shall not be liable for any indirect, incidental, special, or 
              consequential damages arising from your use of the service.
            </p>
          </div>

          <div className={styles.section}>
            <h2>9. Service Modifications</h2>
            <p>
              We reserve the right to modify or discontinue our service at any time, 
              with or without notice. We shall not be liable for any modification, 
              suspension, or discontinuation of the service.
            </p>
          </div>

          <div className={styles.section}>
            <h2>10. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the service 
              immediately, without prior notice, for conduct that we believe violates 
              these Terms or is harmful to other users or our business.
            </p>
          </div>

          <div className={styles.section}>
            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the 
              laws of the jurisdiction in which ComicStop operates, without regard 
              to conflict of law principles.
            </p>
          </div>

          <div className={styles.section}>
            <h2>12. Changes to Terms</h2>
            <p>
              We reserve the right to update these Terms at any time. We will notify 
              users of any material changes by posting the new Terms on our website. 
              Your continued use of the service after such changes constitutes acceptance 
              of the new Terms.
            </p>
          </div>

          <div className={styles.section}>
            <h2>13. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className={styles.contact}>
              <p><strong>Email:</strong> legal@comicstop.com</p>
              <p><strong>Address:</strong> ComicStop Legal Department, 123 Comic Street, Digital City, DC 12345</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}