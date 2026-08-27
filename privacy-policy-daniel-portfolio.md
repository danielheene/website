# Privacy Policy — Personal Developer Portfolio

> **Note:** Replace all bracketed placeholders (`[…]`) with your actual details before publishing.
> This document is not legal advice. Have it reviewed by a qualified German data-protection attorney if in doubt.

---

## 1. Controller

The controller responsible for the processing of personal data on this website within the meaning of the General Data Protection Regulation (GDPR) is:

**[Your full legal name]**
[Street and house number]
[Postal code] Köln
Germany

Email: [your email address]
Website: [your domain, e.g. daniel.heene.io]

The competent data-protection supervisory authority for Cologne, North Rhine-Westphalia is:

**Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW)**
Kavalleriestraße 2–4
40213 Düsseldorf
Germany
Website: https://www.ldi.nrw.de

---

## 2. General Principles

This website is a personal professional portfolio operated to present technical experience, open-source projects, and blog content for the purpose of seeking employment and contract-based opportunities. No user accounts, logins, or persistent cookies are used on this website.

Data is processed only to the extent permitted by applicable law, in particular the GDPR and the German Telecommunications and Digital-Services Data-Protection Act (TDDDG).

---

## 3. Hosting — Hetzner Online GmbH

This website is hosted on a Virtual Private Server (VPS) provided by:

**Hetzner Online GmbH**
Industriestraße 25
91710 Gunzenhausen
Germany
Website: https://www.hetzner.com

When you visit this website, the web server automatically records certain access data in server logs, which may include:

- IP address (anonymised or full, depending on server configuration)
- Date and time of the request
- Requested URL and HTTP method
- HTTP response code and transferred data volume
- Browser type and operating system (user-agent string)
- Referring URL, if applicable

**Purpose and legal basis:** These logs are technically necessary to deliver the website and to detect and investigate security incidents. The legal basis is Article 6(1)(f) GDPR (legitimate interest in operating a secure and functional website).

**Retention:** Server logs are deleted or anonymised after [e.g. 7 days] unless a specific entry is required for the investigation of a security incident.

**Data Processing Agreement:** A Data Processing Agreement (DPA) pursuant to Article 28 GDPR has been concluded with Hetzner Online GmbH via the Hetzner account portal at accounts.hetzner.com/account/dpa.

---

## 4. Content Delivery and DNS — Cloudflare, Inc.

DNS resolution and network traffic for this website are routed through Cloudflare's reverse-proxy infrastructure:

**Cloudflare, Inc.**
101 Townsend Street
San Francisco, CA 94107
USA
Website: https://www.cloudflare.com

When you connect to this website, your request passes through Cloudflare's network. Cloudflare may process connection metadata including IP addresses for the purpose of providing DDoS protection, TLS termination, DNS resolution, and caching. Cloudflare acts as a data processor on behalf of the website operator.

**International transfer:** Cloudflare is a US-based company. Data transfers to the United States are covered by the EU–US Data Privacy Framework (DPF), to which Cloudflare has self-certified. Cloudflare also offers Standard Contractual Clauses (SCCs) under its Data Processing Addendum.

**Legal basis:** Article 6(1)(f) GDPR (legitimate interest in network security and availability).

Cloudflare's privacy policy is available at: https://www.cloudflare.com/privacypolicy/

---

## 5. Web Analytics — Umami (self-hosted)

This website uses Umami for privacy-preserving website analytics. Umami is **self-hosted** on the same Hetzner VPS as the website. No analytics data is transferred to third-party servers or to the public Umami cloud service.

**What Umami collects:**

- Page views and navigation paths
- Referring URL and UTM parameters, if present
- Browser type, operating system, and device type (derived from user-agent string)
- Country of origin (derived from IP address at collection time; the IP address itself is not retained)
- Screen resolution

**What Umami does not collect:**

- IP addresses (not stored after session fingerprinting)
- Persistent identifiers or cross-site tracking identifiers
- Cookies or any data stored on your device
- Personally identifiable information

Umami identifies sessions via a daily rotating salted hash, which makes re-identification across days technically infeasible. No consent banner is required because Umami does not access or store information on your device within the meaning of Section 25(1) TDDDG.

**Legal basis:** Article 6(1)(f) GDPR (legitimate interest in understanding aggregate usage patterns to improve the website).

**Do Not Track:** Umami respects the browser's DNT signal. If your browser sends `DNT: 1`, no analytics data is recorded for your session.

---

## 6. Error Tracking — Sentry (self-hosted)

This website uses a **self-hosted** instance of Sentry for error tracking and anonymous technical logging. Sentry is deployed on the same Hetzner VPS as the website. No error data is transmitted to Sentry's cloud service (sentry.io) or to any third-party server.

**What is processed:** When an application error occurs, Sentry may collect:

- Error type, message, and stack trace
- Browser version, operating system, and device type
- URL at the time of the error
- Anonymised or truncated IP address
- Timing and frequency data

**What is not collected:** No personally identifiable information (PII) is intentionally included in error reports. The Sentry SDK is configured with `sendDefaultPii: false`. No form input data, contact-form messages, or user-provided content is transmitted.

**Retention:** Error logs are retained for a maximum of [e.g. 30 days] and are then deleted automatically.

**Legal basis:** Article 6(1)(f) GDPR (legitimate interest in maintaining the technical reliability of the website).

---

## 7. Contact Form

### 7.1 Data collected

The contact form collects the following information:

- Email address (required)
- Name (optional)
- Message content (required)
- Submission timestamp

### 7.2 Purpose and legal basis

The information you submit is used solely to receive, assess, and respond to your inquiry, including inquiries about employment, contract work, consulting, and open-source collaboration.

The legal basis is Article 6(1)(b) GDPR where the inquiry concerns steps at your request prior to entering into a professional or contractual relationship. For general messages, the legal basis is Article 6(1)(f) GDPR based on the legitimate interest of responding to website visitors.

### 7.3 Email delivery — self-hosted usesend with Amazon SES

Contact-form submissions are delivered by email using a **self-hosted** instance of usesend, which uses Amazon Simple Email Service (Amazon SES) as its outbound delivery relay. The usesend instance runs on the same Hetzner VPS as the website. Amazon SES processes the outbound message routing only.

**Amazon Web Services EMEA SARL**
38 Avenue John F. Kennedy
1855 Luxembourg
Website: https://aws.amazon.com

Your email address and message are transmitted via Amazon SES infrastructure solely to deliver the message to the website operator's inbox. The sender domain is the operator's own domain. Amazon does not use the message content for advertising or profiling.

A Data Processing Agreement with Amazon Web Services is governed by the AWS GDPR Data Processing Addendum, available in the AWS account management console.

### 7.4 Retention

Contact-form messages are retained only for as long as necessary to handle the inquiry and any resulting correspondence. Messages unrelated to an ongoing engagement are generally deleted within [e.g. six months]. If the inquiry leads to a contractual relationship, relevant communication may be retained for the duration of any applicable statutory retention period.

### 7.5 No further use

Your email address and message will not be used for newsletters, marketing communications, or any purpose other than responding to your inquiry, unless you explicitly agree to a different use.

---

## 8. PDF SHA-256 Hash Verification

This website offers an optional feature to verify a PDF document by dragging and dropping it onto a designated area.

**How it works:** The SHA-256 cryptographic hash of the file is computed **entirely within your browser** using the Web Crypto API. The file itself is **never uploaded** to the server. Only the resulting 64-character hexadecimal hash string is transmitted to the backend for comparison against a pre-stored reference hash.

**What is not processed:** The content, filename, or binary data of the PDF is not transmitted, stored, or processed by the server at any point.

**What the backend processes:** The hash string, together with a timestamp and requesting IP address for rate-limiting purposes.

**Retention:** Rate-limiting logs are deleted after [e.g. 24 hours].

**Legal basis:** Article 6(1)(f) GDPR (legitimate interest in offering document-integrity verification without requiring the upload of potentially sensitive documents).

---

## 9. Icons — Iconify (self-hosted)

This website uses the Iconify icon framework to display icons. Iconify is deployed as a **self-hosted** instance on the same Hetzner VPS as the website. All icon assets are served from this server. No requests are made to Iconify's public CDN (api.iconify.design) or to any external icon delivery service.

Because all icon data is served from the operator's own infrastructure, no personal data is transferred to Iconify or any third party for the purpose of icon delivery.

---

## 10. Cookies and Device Storage

This website **does not set any cookies** and does not use localStorage, sessionStorage, IndexedDB, or any other persistent client-side storage. No consent banner is displayed because no cookies or equivalent tracking technologies are used.

---

## 11. Your Rights

Under the GDPR, you have the following rights with respect to personal data processed by the operator of this website:

- **Right of access** (Article 15 GDPR): You may request confirmation of whether personal data concerning you is being processed and, if so, obtain a copy.
- **Right to rectification** (Article 16 GDPR): You may request the correction of inaccurate data.
- **Right to erasure** (Article 17 GDPR): You may request deletion of your data where the applicable conditions are met.
- **Right to restriction of processing** (Article 18 GDPR): You may request that processing be restricted in certain circumstances.
- **Right to data portability** (Article 20 GDPR): Where processing is based on consent or contract, you may request your data in a structured, machine-readable format.
- **Right to object** (Article 21 GDPR): You may object at any time to processing based on Article 6(1)(f) GDPR on grounds relating to your particular situation.
- **Right to withdraw consent** (Article 7(3) GDPR): Where processing is based on your consent, you may withdraw it at any time without affecting the lawfulness of prior processing.

To exercise any of these rights, contact: [your email address]

You also have the right to lodge a complaint with the competent supervisory authority (see Section 1 for LDI NRW contact details).

---

## 12. No Automated Decision-Making

No automated decision-making or profiling within the meaning of Article 22 GDPR takes place on this website.

---

## 13. Third-Party Links

This website may contain links to external websites operated by third parties. The operator has no control over their content or data-processing practices. Please refer to the respective privacy policies of those websites.

---

## 14. Security

The website is served exclusively over HTTPS using a valid TLS certificate. Technical and organisational measures (TOMs) appropriate to the risk of the processing are in place in accordance with Article 32 GDPR. The Hetzner DPA includes Hetzner's TOMs as an annex.

---

## 15. Changes to This Privacy Policy

This privacy policy may be updated to reflect changes to the website, services, or applicable law. The date of the most recent revision is shown below.

**Last updated:** [Date, e.g. August 2026]
