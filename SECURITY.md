# Security Policy

## Supported Versions

The following versions of FacePulse AI are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| 1.1.x   | :x:                |
| < 1.1   | :x:                |

## Reporting a Vulnerability

We take the security of FacePulse AI seriously. If you believe you have found a security vulnerability, please report it to us by following these steps:

1.  **Do not** open a public issue.
2.  Send an email to `security@facepulse.ai` with a detailed description of the vulnerability.
3.  Include steps to reproduce the issue and any potential impact.

We will acknowledge your report within 48 hours and provide a timeline for a fix. Please give us reasonable time to address the issue before making any information public.

## Security Best Practices
- **Camera Access**: FacePulse AI requires browser camera permissions. Ensure you are running the application on a secure (HTTPS or localhost) connection.
- **Local Processing**: AI inference occurs entirely within the browser via TensorFlow.js. No raw video feed is ever transmitted to the backend.
- **Data Sanitization**: All session data sent to the Go backend is sanitized and validated.
