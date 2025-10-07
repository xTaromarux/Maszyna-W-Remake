# Security Policy / Polityka Bezpieczeństwa

## English

### Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |
| < 1.0   | :x:                |

### Reporting a Vulnerability

We take the security of our software seriously. If you have discovered a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to **security@wmaszyna.pl**.

Please include the following information in your report:
- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

We will acknowledge your email within 48 hours and will send a more detailed response within 7 days indicating the next steps in handling your report.

---

## Polski

### Wspierane Wersje

Wydajemy poprawki bezpieczeństwa dla następujących wersji:

| Wersja  | Wspierana          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |
| < 1.0   | :x:                |

### Zgłaszanie Podatności

Bezpieczeństwo naszego oprogramowania traktujemy bardzo poważnie. Jeśli odkryłeś podatność bezpieczeństwa, zgłoś ją nam zgodnie z poniższymi instrukcjami.

**Proszę nie zgłaszać podatności bezpieczeństwa przez publiczne GitHub Issues.**

Zamiast tego, zgłoś je przez email na adres **security@wmaszyna.pl**.

Prosimy o załączenie następujących informacji w zgłoszeniu:
- Typ problemu (np. buffer overflow, SQL injection, cross-site scripting, etc.)
- Pełne ścieżki plików źródłowych związanych z problemem
- Lokalizacja dotkniętego kodu źródłowego (tag/branch/commit lub bezpośredni URL)
- Specjalna konfiguracja wymagana do reprodukcji problemu
- Instrukcje krok po kroku do reprodukcji problemu
- Proof-of-concept lub kod exploit (jeśli możliwe)
- Wpływ problemu, w tym jak napastnik może wykorzystać podatność

Potwierdzimy otrzymanie Twojego emaila w ciągu 48 godzin i wyślemy bardziej szczegółową odpowiedź w ciągu 7 dni wskazującą kolejne kroki w obsłudze Twojego zgłoszenia.

---

## Security Considerations / Uwagi Bezpieczeństwa

### Web Application Security

Since Maszyna W is a web-based educational application, we focus on the following security aspects:

#### Client-Side Security
- **XSS Prevention**: All user inputs are properly sanitized
- **Content Security Policy**: CSP headers prevent code injection
- **Secure Dependencies**: Regular dependency updates and vulnerability scans

#### Data Handling
- **Local Storage**: User programs are stored locally only
- **No Sensitive Data**: Application doesn't collect personal information
- **Secure Communication**: HTTPS enforced in production

#### ESP32 Integration
- **WebSocket Security**: Secure WS connections where possible
- **Input Validation**: All signals from ESP32 are validated
- **Network Isolation**: ESP32 should be on isolated network

### Known Security Limitations

1. **Client-Side Execution**: Code runs in browser environment
2. **WebSocket Communication**: May be vulnerable to man-in-the-middle attacks
3. **Local Storage**: Programs stored in browser storage (not encrypted)

### Security Best Practices for Users

#### For Students/Educators:
- Use application on trusted networks
- Don't share sensitive programs through the simulator
- Keep browser updated for latest security patches

#### For ESP32 Integration:
- Use isolated WiFi network for ESP32 devices
- Change default passwords on ESP32 modules
- Monitor network traffic for unusual activity
- Update ESP32 firmware regularly

#### For Self-Hosting:
- Use HTTPS in production
- Implement proper firewall rules
- Regular security updates
- Monitor server logs

---

## Incident Response Plan / Plan Reagowania na Incydenty

### 1. Initial Response (0-24h)
- Acknowledge security report
- Assess severity level
- Form response team
- Begin preliminary investigation

### 2. Investigation (1-7 days)
- Detailed analysis of vulnerability
- Determine affected versions
- Develop proof-of-concept
- Create fix strategy

### 3. Remediation (7-14 days)
- Develop and test security patch
- Prepare release notes
- Coordinate with reporters
- Plan disclosure timeline

### 4. Disclosure (14-30 days)
- Release security patch
- Publish security advisory
- Notify affected users
- Credit security researchers

### Severity Levels

#### Critical (CVSS 9.0-10.0)
- **Response Time**: 24 hours
- **Fix Timeline**: 7 days
- **Examples**: Remote code execution, sensitive data exposure

#### High (CVSS 7.0-8.9)
- **Response Time**: 48 hours
- **Fix Timeline**: 14 days
- **Examples**: Privilege escalation, significant data leakage

#### Medium (CVSS 4.0-6.9)
- **Response Time**: 7 days
- **Fix Timeline**: 30 days
- **Examples**: XSS, CSRF, information disclosure

#### Low (CVSS 0.1-3.9)
- **Response Time**: 14 days
- **Fix Timeline**: 60 days
- **Examples**: Minor information leaks, DoS conditions

---

## Security Contact Information

### Primary Contacts
- **Security Team**: security@wmaszyna.pl
- **Project Lead**: team@wmaszyna.pl
- **Emergency**: +48 (for critical issues affecting educational institutions)

### PGP Key for Encrypted Communication

```
-----BEGIN PGP PUBLIC KEY BLOCK-----
[PGP key would be here in real implementation]
-----END PGP PUBLIC KEY BLOCK-----
```

Key fingerprint: `1234 5678 9ABC DEF0 1234 5678 9ABC DEF0 12345678`

### Response Times by Contact Method

| Method | Response Time | Use For |
|--------|---------------|---------|
| Email (security@wmaszyna.pl) | 24-48h | All security reports |
| GitHub Security Advisory | 24-48h | Public disclosure coordination |
| Emergency Phone | 4h | Critical educational disruptions |

---

## Hall of Fame / Tablica Uznań

We appreciate security researchers who help improve our project:

### 2025
- *[First security researcher will be listed here]*

### Responsible Disclosure Recognition

Contributors who follow responsible disclosure practices receive:
- Public recognition in security advisory
- Credit in release notes  
- Invitation to beta test security features
- Special contributor badge
- Optional mention in project documentation

---

## Security Updates and Notifications

### How to Stay Informed

1. **GitHub Watch**: Enable security alerts on the repository
2. **Release Notes**: Check CHANGELOG.md for security fixes
3. **Security Advisories**: Follow GitHub security tab
4. **Email List**: Subscribe to security-notifications@wmaszyna.pl
5. **RSS Feed**: Security releases are tagged in RSS feed

### Automatic Updates

For users deploying Maszyna W:

```bash
# Enable automatic security updates
npm audit
npm audit fix

# Check for vulnerabilities
npm audit --audit-level moderate
```

### Dependencies Security

We monitor dependencies for security issues:
- **Automated**: Dependabot alerts and updates
- **Manual**: Weekly security audit reviews
- **Tools**: npm audit, Snyk, GitHub security advisories

---

## Compliance and Standards

### Educational Technology Standards
- **FERPA**: No student data collection
- **COPPA**: Age-appropriate content and privacy
- **GDPR**: Minimal data processing (EU users)

### Development Standards
- **OWASP Top 10**: Regular assessment against common vulnerabilities
- **NIST Cybersecurity Framework**: Risk management approach
- **Secure Development Lifecycle**: Security integrated into development

### Audit Trail
- All security-related changes are documented
- Security decisions are reviewed and approved
- Regular security assessments by third parties

---

## Contact for Security Questions

If you have questions about this security policy or need clarification:

- **General Questions**: security@wmaszyna.pl
- **Educational Institution Partnerships**: edu@wmaszyna.pl  
- **Technical Security Details**: team@wmaszyna.pl

---

**This security policy is reviewed and updated regularly. Last updated: January 7, 2025**

*We believe that security through transparency and community collaboration makes everyone safer.* 🔒