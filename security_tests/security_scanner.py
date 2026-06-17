"""Security vulnerability scanner for CiviFix"""
import os
import re
import logging
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SecurityVulnerabilityScanner:
    """Scan codebase for security vulnerabilities"""
    
    def __init__(self, root_path):
        self.root_path = root_path
        self.vulnerabilities = []
        self.findings = []
    
    def scan(self):
        """Run all security scans"""
        logger.info("Starting security vulnerability scan...")
        
        self._scan_authentication()
        self._scan_authorization()
        self._scan_injection()
        self._scan_input_validation()
        self._scan_sensitive_data()
        self._scan_api_security()
        self._scan_infrastructure()
        
        return self.findings
    
    def _scan_authentication(self):
        """Scan for authentication issues"""
        logger.info("Scanning authentication...")
        
        # Check for missing auth checks
        auth_files = self._find_files("*routes.py")
        
        for file_path in auth_files:
            content = self._read_file(file_path)
            
            # Check for endpoints without authentication
            if "@router.get" in content or "@router.post" in content:
                if "Depends(get_current_user)" not in content:
                    # Some endpoints should be public, so only flag if they seem like they shouldn't be
                    if not any(public in file_path for public in ["auth_routes", "public"]):
                        self.findings.append({
                            "severity": "MEDIUM",
                            "file": file_path,
                            "vulnerability": "Missing Authentication",
                            "description": "Endpoint may be missing authentication check (Depends(get_current_user))",
                            "remediation": "Add authentication dependency to protected endpoints",
                            "line": self._find_line_number(content, "@router")
                        })
    
    def _scan_authorization(self):
        """Scan for authorization issues"""
        logger.info("Scanning authorization...")
        
        # Check for role-based access control issues
        role_files = self._find_files("*routes.py", "*dependency.py")
        
        for file_path in role_files:
            content = self._read_file(file_path)
            
            # Check for hardcoded roles without proper validation
            hardcoded_roles = re.findall(r'role\s*==\s*["\'](\w+)["\']', content)
            if hardcoded_roles:
                self.findings.append({
                    "severity": "MEDIUM",
                    "file": file_path,
                    "vulnerability": "Role-based Authorization Issues",
                    "description": f"Hardcoded role checks: {', '.join(set(hardcoded_roles))}. Consider using centralized role management.",
                    "remediation": "Use role dependency injection from auth_dependency module",
                    "line": self._find_line_number(content, "role ==")
                })
    
    def _scan_injection(self):
        """Scan for injection vulnerabilities"""
        logger.info("Scanning injection attacks...")
        
        python_files = self._find_files("*.py")
        
        for file_path in python_files:
            content = self._read_file(file_path)
            
            # Check for NoSQL injection patterns
            dangerous_patterns = [
                (r'find_one\(\s*\{[^}]*\{0\}', "NoSQL Injection - user input in query"),
                (r'exec\s*\(', "Code Injection - exec() usage"),
                (r'eval\s*\(', "Code Injection - eval() usage"),
                (r'os\.system\s*\(', "Command Injection - os.system() usage"),
            ]
            
            for pattern, desc in dangerous_patterns:
                if re.search(pattern, content):
                    self.findings.append({
                        "severity": "CRITICAL",
                        "file": file_path,
                        "vulnerability": "Injection Vulnerability",
                        "description": desc,
                        "remediation": "Use parameterized queries and avoid dynamic code execution",
                        "line": self._find_line_number(content, pattern.split(r'\(')[0])
                    })
            
            # Check for path traversal
            if "path.join" in content and "\.." in content:
                self.findings.append({
                    "severity": "HIGH",
                    "file": file_path,
                    "vulnerability": "Path Traversal",
                    "description": "Potential path traversal vulnerability detected",
                    "remediation": "Validate and sanitize file paths; use secure path operations",
                    "line": self._find_line_number(content, "path.join")
                })
    
    def _scan_input_validation(self):
        """Scan for input validation issues"""
        logger.info("Scanning input validation...")
        
        schema_files = self._find_files("*schema.py")
        
        for file_path in schema_files:
            content = self._read_file(file_path)
            
            # Check for missing field validation
            if "str" in content:
                if not re.search(r'max_length|min_length|regex', content):
                    self.findings.append({
                        "severity": "MEDIUM",
                        "file": file_path,
                        "vulnerability": "Missing Input Validation",
                        "description": "String fields lack length constraints or format validation",
                        "remediation": "Add validators: max_length, min_length, regex patterns",
                        "line": 1
                    })
    
    def _scan_sensitive_data(self):
        """Scan for sensitive data exposure"""
        logger.info("Scanning sensitive data...")
        
        all_files = self._find_files("*.py", "*.env", "*.json", "*.txt")
        
        sensitive_patterns = [
            (r'password\s*=\s*["\'][^"\']+["\']', "Hardcoded Password"),
            (r'api[_\-]?key\s*=\s*["\'][^"\']+["\']', "Hardcoded API Key"),
            (r'secret[_\-]?key\s*=\s*["\'][^"\']+["\']', "Hardcoded Secret"),
            (r'token\s*=\s*["\'][^"\']+["\']', "Hardcoded Token"),
            (r'mongodb[_\-]?url\s*=\s*["\'][^"\']+["\']', "Hardcoded Database URL"),
        ]
        
        for file_path in all_files:
            if ".env" in file_path:  # Skip .env files as they're expected
                continue
            
            content = self._read_file(file_path)
            
            for pattern, desc in sensitive_patterns:
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    self.findings.append({
                        "severity": "CRITICAL",
                        "file": file_path,
                        "vulnerability": "Hardcoded Secrets",
                        "description": desc,
                        "remediation": "Move to environment variables or secure vault",
                        "line": self._find_line_number(content, match.group())
                    })
    
    def _scan_api_security(self):
        """Scan for API security issues"""
        logger.info("Scanning API security...")
        
        main_file = os.path.join(self.root_path, "app/main.py")
        if os.path.exists(main_file):
            content = self._read_file(main_file)
            
            # Check for CORS configuration
            if "allow_origins" in content:
                if '"*"' in content or "['*']" in content:
                    self.findings.append({
                        "severity": "HIGH",
                        "file": main_file,
                        "vulnerability": "Insecure CORS Configuration",
                        "description": "CORS allows all origins (*), which is a security risk",
                        "remediation": "Restrict CORS to specific trusted domains",
                        "line": self._find_line_number(content, "allow_origins")
                    })
            
            # Check for security headers
            required_headers = [
                "X-Content-Type-Options",
                "X-Frame-Options",
                "Referrer-Policy",
                "X-XSS-Protection"
            ]
            
            for header in required_headers:
                if header not in content:
                    # Some headers might be missing - this is a finding
                    pass
    
    def _scan_infrastructure(self):
        """Scan for infrastructure issues"""
        logger.info("Scanning infrastructure...")
        
        config_file = os.path.join(self.root_path, "app/core/config.py")
        if os.path.exists(config_file):
            content = self._read_file(config_file)
            
            # Check for debug mode
            if "ENV" in content and "development" in content.lower():
                self.findings.append({
                    "severity": "MEDIUM",
                    "file": config_file,
                    "vulnerability": "Debug Mode Enabled",
                    "description": "Application running in development/debug mode",
                    "remediation": "Ensure production environment is set; disable debug logging",
                    "line": self._find_line_number(content, "ENV")
                })
            
            # Check requirements for known vulnerable packages
            req_file = os.path.join(self.root_path, "../requirements.txt")
            if os.path.exists(req_file):
                self._check_vulnerable_dependencies(req_file)
    
    def _check_vulnerable_dependencies(self, req_file):
        """Check for known vulnerable dependencies"""
        content = self._read_file(req_file)
        
        # This is a simplified check; in production use tools like safety or Snyk
        vulnerable_packages = {
            "django": "1.11",  # Outdated
            "flask": "0.12",   # Outdated
        }
        
        for package, version in vulnerable_packages.items():
            if package in content.lower():
                self.findings.append({
                    "severity": "MEDIUM",
                    "file": req_file,
                    "vulnerability": "Known Vulnerable Dependency",
                    "description": f"Package '{package}' may have known vulnerabilities",
                    "remediation": "Update to latest stable version; use pip-audit or safety tools",
                    "line": self._find_line_number(content, package)
                })
    
    def _find_files(self, *patterns):
        """Find files matching patterns"""
        files = []
        for root, dirs, filenames in os.walk(self.root_path):
            # Skip common directories
            dirs[:] = [d for d in dirs if d not in ['.git', '__pycache__', '.pytest_cache', 'node_modules']]
            
            for pattern in patterns:
                for filename in filenames:
                    if self._matches_pattern(filename, pattern):
                        files.append(os.path.join(root, filename))
        
        return files
    
    def _matches_pattern(self, filename, pattern):
        """Check if filename matches pattern"""
        import fnmatch
        return fnmatch.fnmatch(filename, pattern)
    
    def _read_file(self, file_path):
        """Read file content safely"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except:
            return ""
    
    def _find_line_number(self, content, search_text):
        """Find line number for text"""
        if not search_text:
            return 1
        
        lines = content.split('\n')
        for i, line in enumerate(lines, 1):
            if search_text.lower() in line.lower():
                return i
        return 1
    
    def get_findings_by_severity(self):
        """Get findings organized by severity"""
        findings_by_severity = {}
        for finding in self.findings:
            severity = finding.get("severity")
            if severity not in findings_by_severity:
                findings_by_severity[severity] = []
            findings_by_severity[severity].append(finding)
        return findings_by_severity


def scan_civifix_security():
    """Scan CiviFix codebase"""
    backend_path = r"C:\CiviFix-Refactored\agents-fastapi-auth-module-implementation\app"
    
    scanner = SecurityVulnerabilityScanner(backend_path)
    findings = scanner.scan()
    
    # Sort by severity
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    findings.sort(key=lambda x: severity_order.get(x.get("severity"), 4))
    
    return findings


if __name__ == "__main__":
    findings = scan_civifix_security()
    print(f"\nFound {len(findings)} vulnerabilities:\n")
    for finding in findings:
        print(f"[{finding['severity']}] {finding['vulnerability']}")
        print(f"  File: {finding['file']}")
        print(f"  Description: {finding['description']}")
        print(f"  Remediation: {finding['remediation']}\n")
