/**
 * Default policy page templates.
 * Dynamic tokens: {{brandName}}, {{currentYear}}, {{contactEmail}}
 * These are replaced with actual store values at creation time.
 */

export interface PolicyPageTemplate {
  title: string;
  slug: string;
  description: string;
  showInFooter: boolean;
  sortOrder: number;
  richTextContent: (ctx: { brandName: string; currentYear: number; contactEmail: string }) => string;
}

export const DEFAULT_POLICY_PAGES: PolicyPageTemplate[] = [
  // ────────────────────────────────────────────────────────────
  // 1. Shipping Policy
  // ────────────────────────────────────────────────────────────
  {
    title: 'Shipping Policy',
    slug: 'shipping-policy',
    description: 'Information about our shipping methods, timelines, and costs.',
    showInFooter: true,
    sortOrder: 10,
    richTextContent: ({ brandName, currentYear, contactEmail }) => `
<h1><strong>Shipping Policy</strong></h1>
<p>Last updated: January 1, ${currentYear}</p>
<p>Thank you for shopping at <strong>${brandName}</strong>. This Shipping Policy explains how we process and ship your orders.</p>

<h2><strong>1. Processing Time</strong></h2>
<p>All orders are processed within <strong>1–2 business days</strong> (Monday through Friday, excluding public holidays). Orders placed after 5:00 PM IST will be processed the next business day.</p>

<h2><strong>2. Shipping Methods &amp; Delivery Times</strong></h2>
<ul>
  <li><strong>Standard Shipping:</strong> 5–7 business days</li>
  <li><strong>Express Shipping:</strong> 2–3 business days</li>
  <li><strong>Same-Day Delivery:</strong> Available in select cities (order before 12:00 PM)</li>
</ul>
<p>Delivery times are estimates and may vary during peak seasons or due to courier delays.</p>

<h2><strong>3. Shipping Charges</strong></h2>
<ul>
  <li>Free shipping on orders above ₹499</li>
  <li>Standard shipping: ₹49 for orders below ₹499</li>
  <li>Express shipping: Additional charges apply at checkout</li>
</ul>

<h2><strong>4. Order Tracking</strong></h2>
<p>Once your order is shipped, you will receive a confirmation email with a tracking number. You can track your order on our website or through the courier's website.</p>

<h2><strong>5. Shipping Restrictions</strong></h2>
<p>Currently, we ship to all major cities and towns across India. International shipping is not available at this time.</p>

<h2><strong>6. Damaged or Lost Packages</strong></h2>
<p>If your order arrives damaged or is lost in transit, please contact us immediately at <a href="mailto:${contactEmail}">${contactEmail}</a>. We will work with you to resolve the issue promptly.</p>

<h2><strong>7. Contact Us</strong></h2>
<p>For any shipping-related queries, please reach out to our support team at <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
`.trim(),
  },

  // ────────────────────────────────────────────────────────────
  // 2. Cancellation & Return Policy
  // ────────────────────────────────────────────────────────────
  {
    title: 'Cancellation & Return Policy',
    slug: 'return-policy',
    description: 'Our policy on order cancellations, returns, and refunds.',
    showInFooter: true,
    sortOrder: 11,
    richTextContent: ({ brandName, currentYear, contactEmail }) => `
<h1><strong>Cancellation &amp; Return Policy</strong></h1>
<p>Last updated: January 1, ${currentYear}</p>
<p>At <strong>${brandName}</strong>, we want you to be completely satisfied with your purchase. Please read our policy carefully.</p>

<h2><strong>1. Order Cancellation</strong></h2>
<ul>
  <li>Orders can be cancelled within <strong>24 hours</strong> of placement, provided they have not been shipped.</li>
  <li>To cancel an order, log in to your account and go to <strong>My Orders</strong>, or contact us at <a href="mailto:${contactEmail}">${contactEmail}</a>.</li>
  <li>Once an order has been dispatched, it cannot be cancelled.</li>
</ul>

<h2><strong>2. Return Policy</strong></h2>
<p>We accept returns within <strong>7 days</strong> of delivery, subject to the following conditions:</p>
<ul>
  <li>The item must be unused and in its original packaging.</li>
  <li>All tags, labels, and accessories must be intact.</li>
  <li>Proof of purchase (order number or invoice) must be provided.</li>
  <li>Items marked as <strong>non-returnable</strong> at the time of purchase cannot be returned.</li>
</ul>

<h2><strong>3. Non-Returnable Items</strong></h2>
<ul>
  <li>Perishable goods (food, flowers, etc.)</li>
  <li>Personalised or customised products</li>
  <li>Intimate or sanitary goods</li>
  <li>Digital downloads or gift cards</li>
</ul>

<h2><strong>4. Return Process</strong></h2>
<ol>
  <li>Email us at <a href="mailto:${contactEmail}">${contactEmail}</a> with your order number and reason for return.</li>
  <li>We will provide a Return Merchandise Authorization (RMA) number and instructions.</li>
  <li>Pack the item securely and ship it back to the address provided.</li>
  <li>Return shipping costs are borne by the customer unless the item is defective or incorrect.</li>
</ol>

<h2><strong>5. Refunds</strong></h2>
<p>Once we receive and inspect the returned item, we will notify you of the approval or rejection of your refund.</p>
<ul>
  <li><strong>Approved refunds</strong> will be processed within <strong>5–7 business days</strong> to your original payment method.</li>
  <li>Bank processing times may add 2–3 additional business days.</li>
</ul>

<h2><strong>6. Exchange</strong></h2>
<p>We replace items only if they are defective or damaged. If you need an exchange, email us at <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
`.trim(),
  },

  // ────────────────────────────────────────────────────────────
  // 3. Privacy Policy
  // ────────────────────────────────────────────────────────────
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    description: 'How we collect, use, and protect your personal information.',
    showInFooter: true,
    sortOrder: 12,
    richTextContent: ({ brandName, currentYear, contactEmail }) => `
<h1><strong>Privacy Policy</strong></h1>
<p>Last updated: January 1, ${currentYear}</p>
<p><strong>${brandName}</strong> ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>

<h2><strong>1. Information We Collect</strong></h2>
<h3>Personal Information</h3>
<ul>
  <li>Name, email address, phone number</li>
  <li>Billing and shipping address</li>
  <li>Payment information (processed securely; we do not store card details)</li>
  <li>Account login credentials</li>
</ul>
<h3>Automatically Collected Information</h3>
<ul>
  <li>IP address, browser type, device information</li>
  <li>Pages visited, time spent on pages, links clicked</li>
  <li>Cookies and similar tracking technologies</li>
</ul>

<h2><strong>2. How We Use Your Information</strong></h2>
<ul>
  <li>To process and fulfil your orders</li>
  <li>To communicate with you about your orders and account</li>
  <li>To send promotional emails and offers (you may opt out at any time)</li>
  <li>To improve our website, products, and services</li>
  <li>To comply with legal obligations</li>
  <li>To prevent fraud and ensure security</li>
</ul>

<h2><strong>3. Sharing Your Information</strong></h2>
<p>We do not sell your personal information. We may share it with:</p>
<ul>
  <li><strong>Service providers:</strong> Payment processors, shipping companies, email service providers</li>
  <li><strong>Legal authorities:</strong> When required by law or to protect our legal rights</li>
  <li><strong>Business transfers:</strong> In connection with a merger, sale, or acquisition</li>
</ul>

<h2><strong>4. Cookies</strong></h2>
<p>We use cookies to enhance your browsing experience. You can control cookie settings through your browser. Disabling cookies may affect some website functionality.</p>

<h2><strong>5. Data Security</strong></h2>
<p>We implement industry-standard security measures including SSL encryption, secure servers, and regular security audits to protect your data.</p>

<h2><strong>6. Your Rights</strong></h2>
<ul>
  <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
  <li><strong>Correction:</strong> Request correction of inaccurate data</li>
  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
</ul>

<h2><strong>7. Third-Party Links</strong></h2>
<p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of those websites.</p>

<h2><strong>8. Changes to This Policy</strong></h2>
<p>We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new policy on this page with an updated date.</p>

<h2><strong>9. Contact Us</strong></h2>
<p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
`.trim(),
  },

  // ────────────────────────────────────────────────────────────
  // 4. Terms & Conditions
  // ────────────────────────────────────────────────────────────
  {
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    description: 'The terms and conditions governing your use of our website and services.',
    showInFooter: true,
    sortOrder: 13,
    richTextContent: ({ brandName, currentYear, contactEmail }) => `
<h1><strong>Terms &amp; Conditions</strong></h1>
<p>Last updated: January 1, ${currentYear}</p>
<p>Please read these Terms and Conditions carefully before using the <strong>${brandName}</strong> website. By accessing or using our website, you agree to be bound by these terms.</p>

<h2><strong>1. Acceptance of Terms</strong></h2>
<p>By accessing and using this website, you accept and agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please do not use our website.</p>

<h2><strong>2. Use of the Website</strong></h2>
<ul>
  <li>You must be at least <strong>18 years old</strong> to make a purchase.</li>
  <li>You agree to provide accurate and complete information when creating an account or placing an order.</li>
  <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
  <li>You agree not to use the website for any unlawful or prohibited purpose.</li>
</ul>

<h2><strong>3. Products &amp; Pricing</strong></h2>
<ul>
  <li>All prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.</li>
  <li>We reserve the right to modify prices at any time without prior notice.</li>
  <li>Product images are for illustrative purposes; actual products may vary slightly.</li>
  <li>We reserve the right to limit quantities and refuse service at our discretion.</li>
</ul>

<h2><strong>4. Orders &amp; Payment</strong></h2>
<ul>
  <li>Placing an order constitutes an offer to purchase. We reserve the right to accept or reject any order.</li>
  <li>Payment must be completed at the time of purchase using the payment methods available on our website.</li>
  <li>We use secure payment gateways and do not store your payment card information.</li>
</ul>

<h2><strong>5. Intellectual Property</strong></h2>
<p>All content on this website — including text, images, logos, and graphics — is the property of <strong>${brandName}</strong> and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>

<h2><strong>6. Limitation of Liability</strong></h2>
<p>To the fullest extent permitted by law, <strong>${brandName}</strong> shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products.</p>

<h2><strong>7. Governing Law</strong></h2>
<p>These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.</p>

<h2><strong>8. Changes to Terms</strong></h2>
<p>We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting. Continued use of the website constitutes acceptance of the revised terms.</p>

<h2><strong>9. Contact Us</strong></h2>
<p>For questions about these Terms and Conditions, contact us at <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
`.trim(),
  },

  // ────────────────────────────────────────────────────────────
  // 5. Terms of Service (TOS)
  // ────────────────────────────────────────────────────────────
  {
    title: 'Terms of Service',
    slug: 'terms-of-service',
    description: 'Terms governing the use of our services and platform.',
    showInFooter: true,
    sortOrder: 14,
    richTextContent: ({ brandName, currentYear, contactEmail }) => `
<h1><strong>Terms of Service</strong></h1>
<p>Last updated: January 1, ${currentYear}</p>
<p>These Terms of Service ("Terms") govern your access to and use of <strong>${brandName}</strong>'s services, including our website, mobile applications, and any other platform we operate (collectively, the "Services").</p>

<h2><strong>1. Your Agreement</strong></h2>
<p>By creating an account or using our Services, you confirm that you have read, understood, and agree to these Terms. If you disagree, you must not use our Services.</p>

<h2><strong>2. Account Registration</strong></h2>
<ul>
  <li>You must provide accurate and up-to-date information when registering.</li>
  <li>You are solely responsible for all activity that occurs under your account.</li>
  <li>You must notify us immediately of any unauthorised use of your account.</li>
  <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
</ul>

<h2><strong>3. Prohibited Activities</strong></h2>
<p>You agree not to:</p>
<ul>
  <li>Use the Services for any illegal or fraudulent purpose</li>
  <li>Impersonate any person or entity</li>
  <li>Attempt to gain unauthorised access to any part of our Services</li>
  <li>Interfere with or disrupt the integrity or performance of the Services</li>
  <li>Upload or transmit viruses, malware, or other malicious code</li>
  <li>Harvest or collect user data without consent</li>
</ul>

<h2><strong>4. Service Availability</strong></h2>
<p>We strive to maintain continuous service availability but do not guarantee uninterrupted access. We may suspend or modify the Services at any time for maintenance, updates, or other reasons, with or without notice.</p>

<h2><strong>5. User Content</strong></h2>
<p>If you submit reviews, comments, or other content on our platform, you grant us a non-exclusive, royalty-free licence to use, reproduce, and display that content in connection with our Services. You represent that you have all rights necessary to grant this licence.</p>

<h2><strong>6. Disclaimer of Warranties</strong></h2>
<p>Our Services are provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>

<h2><strong>7. Indemnification</strong></h2>
<p>You agree to indemnify and hold harmless <strong>${brandName}</strong>, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of your use of the Services or violation of these Terms.</p>

<h2><strong>8. Termination</strong></h2>
<p>Either party may terminate this agreement at any time. Upon termination, your right to access and use the Services will immediately cease. Provisions that by their nature should survive termination will remain in effect.</p>

<h2><strong>9. Contact Information</strong></h2>
<p>If you have any questions about these Terms of Service, please contact our support team at <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
<p><em>&copy; ${currentYear} ${brandName}. All rights reserved.</em></p>
`.trim(),
  },
];
