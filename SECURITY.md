# Security Policy

## Supported versions

This is a continuously deployed application. Only the latest code on the
`main` branch (and the live production deployment) is supported.

## Reporting a vulnerability

If you discover a security vulnerability, please **do not open a public issue or
pull request**. Instead, report it privately:

- Email: **support@dogmagroup.co.uk**
- Include: a description, steps to reproduce, affected URL/endpoint, and impact.

We aim to acknowledge reports within a few business days and will keep you
updated as we investigate and remediate. Please give us a reasonable opportunity
to fix the issue before any public disclosure.

## Handling of secrets

- All secrets (database URL, auth secret, payment keys, SMTP/Resend, Cloudinary)
  live in environment variables only — never in the repository. See
  `.env.example` for the contract.
- Payment webhooks are verified server-side (signature/lookup) before any booking
  is marked paid; client-reported success is never trusted.
