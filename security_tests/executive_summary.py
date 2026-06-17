"""Generate executive summary of security assessment"""
from datetime import datetime
from security_scanner import scan_civifix_security


def generate_executive_summary(filename="EXECUTIVE_SUMMARY.md"):
    """Generate executive summary of security assessment"""
    
    findings = scan_civifix_security()
    
    severity_counts = {}
    for finding in findings:
        severity = finding.get("severity", "LOW")
        severity_counts[severity] = severity_counts.get(severity, 0) + 1
    
    total_critical = severity_counts.get("CRITICAL", 0)
    total_high = severity_counts.get("HIGH", 0)
    total_medium = severity_counts.get("MEDIUM", 0)
    total_low = severity_counts.get("LOW", 0)
    total_findings = len(findings)
    
    content = []
    
    # Header
    content.append("# CiviFix Security Assessment - Executive Summary\n\n")
    content.append(f"**Assessment Date:** {datetime.now().strftime('%Y-%m-%d')}\n")
    content.append(f"**Organization:** CiviFix Development Team\n")
    content.append(f"**Application:** CiviFix Complaint Management Platform\n")
    content.append(f"**Assessment Scope:** Backend API (FastAPI), Frontend (Next.js), Database (MongoDB)\n")
    content.append(f"**Assessment Type:** Source Code Analysis + Security Review\n\n")
    
    # Overview
    content.append("## Overview\n\n")
    content.append(f"A comprehensive security assessment was conducted on the CiviFix application. The assessment identified **{total_findings}** security vulnerabilities across the codebase.\n\n")
    
    # Risk Summary
    content.append("## Risk Summary\n\n")
    content.append("| Severity | Count | Percentage |\n")
    content.append("|----------|-------|------------|\n")
    content.append(f"| CRITICAL | {total_critical} | {total_critical/total_findings*100:.1f}% |\n")
    content.append(f"| HIGH     | {total_high} | {total_high/total_findings*100:.1f}% |\n")
    content.append(f"| MEDIUM   | {total_medium} | {total_medium/total_findings*100:.1f}% |\n")
    content.append(f"| LOW      | {total_low} | {total_low/total_findings*100:.1f}% |\n\n")
    
    # Key Findings
    content.append("## Key Findings\n\n")
    
    if total_critical > 0:
        content.append(f"### 🔴 Critical Issues ({total_critical})\n\n")
        content.append("**Critical vulnerabilities pose an immediate risk to application security and user data:**\n\n")
        
        critical_findings = [f for f in findings if f.get("severity") == "CRITICAL"]
        for i, finding in enumerate(critical_findings[:5], 1):  # Show first 5
            content.append(f"{i}. **{finding['vulnerability']}** - {finding['description']}\n")
        
        if len(critical_findings) > 5:
            content.append(f"\n...and {len(critical_findings)-5} more critical issues.\n\n")
        else:
            content.append("\n")
    
    if total_high > 0:
        content.append(f"### 🟠 High Priority Issues ({total_high})\n\n")
        content.append("**High severity vulnerabilities should be addressed within 1-2 weeks:**\n\n")
        
        high_findings = [f for f in findings if f.get("severity") == "HIGH"]
        for i, finding in enumerate(high_findings[:5], 1):
            content.append(f"{i}. {finding['vulnerability']}\n")
        
        if len(high_findings) > 5:
            content.append(f"\n...and {len(high_findings)-5} more high priority issues.\n\n")
        else:
            content.append("\n")
    
    # Vulnerability Categories
    content.append("## Vulnerability Categories\n\n")
    content.append("The identified vulnerabilities fall into the following categories:\n\n")
    content.append("### 1. Authentication & Authorization\n")
    content.append("- Missing authentication checks on certain endpoints\n")
    content.append("- Weak session management\n")
    content.append("- Missing authorization validations\n\n")
    
    content.append("### 2. Injection Attacks\n")
    content.append("- NoSQL injection potential in database queries\n")
    content.append("- Command injection risks from unsafe operations\n")
    content.append("- Path traversal vulnerabilities\n\n")
    
    content.append("### 3. Sensitive Data Exposure\n")
    content.append("- Hardcoded credentials in source code\n")
    content.append("- API keys in configuration files\n")
    content.append("- Insufficient data encryption\n\n")
    
    content.append("### 4. API Security\n")
    content.append("- Overly permissive CORS configuration\n")
    content.append("- Missing security headers\n")
    content.append("- Lack of rate limiting\n\n")
    
    content.append("### 5. Input Validation\n")
    content.append("- Missing or insufficient input validation\n")
    content.append("- Unsafe file upload handling\n")
    content.append("- Lack of output encoding\n\n")
    
    # Risk Assessment
    content.append("## Risk Assessment\n\n")
    content.append("### Current Risk Level: **HIGH**\n\n")
    content.append("The application faces significant security risks due to:\n")
    content.append("- Critical vulnerabilities that could lead to data breaches\n")
    content.append("- Weak authentication/authorization mechanisms\n")
    content.append("- Insufficient input validation\n")
    content.append("- Hardcoded secrets and credentials\n\n")
    
    # Recommendations
    content.append("## Immediate Actions Required\n\n")
    content.append("### Priority 1 (Immediate - Within 24-48 hours)\n")
    content.append("1. **Secure Credential Management**\n")
    content.append("   - Remove all hardcoded secrets from source code\n")
    content.append("   - Implement environment variable management\n")
    content.append("   - Use AWS Secrets Manager or similar solution\n\n")
    
    content.append("2. **Authentication Enforcement**\n")
    content.append("   - Add authentication checks to all protected endpoints\n")
    content.append("   - Implement proper token validation\n")
    content.append("   - Review and fix authorization logic\n\n")
    
    content.append("3. **CORS Configuration**\n")
    content.append("   - Restrict CORS to specific trusted domains\n")
    content.append("   - Implement proper origin validation\n\n")
    
    content.append("### Priority 2 (Urgent - Within 1 week)\n")
    content.append("1. **Input Validation**\n")
    content.append("   - Add comprehensive input validation to all endpoints\n")
    content.append("   - Implement schema validation with Pydantic\n\n")
    
    content.append("2. **Injection Prevention**\n")
    content.append("   - Audit all database queries for injection vulnerabilities\n")
    content.append("   - Use parameterized queries\n")
    content.append("   - Remove dangerous operations (exec, eval)\n\n")
    
    content.append("3. **Security Headers**\n")
    content.append("   - Add all required security headers\n")
    content.append("   - Implement CSP (Content Security Policy)\n\n")
    
    content.append("### Priority 3 (Important - Within 2 weeks)\n")
    content.append("1. **Dependency Management**\n")
    content.append("   - Update all packages to latest stable versions\n")
    content.append("   - Use tools like pip-audit and safety for vulnerability scanning\n\n")
    
    content.append("2. **Rate Limiting & DoS Protection**\n")
    content.append("   - Implement rate limiting on all endpoints\n")
    content.append("   - Add request throttling\n\n")
    
    content.append("3. **Error Handling**\n")
    content.append("   - Implement proper error handling\n")
    content.append("   - Avoid exposing sensitive information in error messages\n\n")
    
    # Remediation Timeline
    content.append("## Remediation Timeline\n\n")
    content.append("| Phase | Duration | Key Activities |\n")
    content.append("|-------|----------|----------------|\n")
    content.append("| 1 | 1-2 days | Fix critical issues (secrets, auth) |\n")
    content.append("| 2 | 3-7 days | Implement validation & injection fixes |\n")
    content.append("| 3 | 1-2 weeks | Update dependencies & add security headers |\n")
    content.append("| 4 | Ongoing | Implement security monitoring & logging |\n\n")
    
    # Testing Recommendations
    content.append("## Testing Recommendations\n\n")
    content.append("1. **Penetration Testing**\n")
    content.append("   - Conduct authorized penetration testing\n")
    content.append("   - Focus on authentication/authorization flows\n")
    content.append("   - Test API endpoints for injection vulnerabilities\n\n")
    
    content.append("2. **Security Scanning**\n")
    content.append("   - Implement SAST (Static Application Security Testing)\n")
    content.append("   - Use DAST (Dynamic Application Security Testing)\n")
    content.append("   - Regular dependency scanning\n\n")
    
    content.append("3. **Compliance & Standards**\n")
    content.append("   - OWASP Top 10 compliance check\n")
    content.append("   - CWE/CVSS scoring assessment\n\n")
    
    # Monitoring & Logging
    content.append("## Ongoing Security Measures\n\n")
    content.append("1. **Implement Security Logging**\n")
    content.append("   - Log all authentication attempts\n")
    content.append("   - Track authorization failures\n")
    content.append("   - Monitor suspicious activities\n\n")
    
    content.append("2. **Security Monitoring**\n")
    content.append("   - Set up alerting for suspicious patterns\n")
    content.append("   - Implement intrusion detection\n\n")
    
    content.append("3. **Regular Assessments**\n")
    content.append("   - Monthly security reviews\n")
    content.append("   - Quarterly penetration testing\n")
    content.append("   - Annual comprehensive assessment\n\n")
    
    # Conclusion
    content.append("## Conclusion\n\n")
    content.append(f"The CiviFix application requires immediate attention to address {total_critical} critical security vulnerabilities. ")
    content.append("While the application has good foundation with proper libraries for security (JWT, bcrypt), several implementation issues need to be fixed. ")
    content.append("\n\n")
    content.append("Following the recommended remediation plan and prioritization will significantly improve the security posture of the application. ")
    content.append("After addressing critical and high-priority issues, the application risk level should reduce from HIGH to MEDIUM-LOW.\n\n")
    
    content.append("---\n\n")
    content.append(f"*Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n")
    
    # Write to file
    with open(filename, 'w') as f:
        f.writelines(content)
    
    print(f"Executive summary saved: {filename}")
    return filename


if __name__ == "__main__":
    generate_executive_summary()
