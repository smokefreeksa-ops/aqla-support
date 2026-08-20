# Staging deployment trigger — 2026-08-20

This no-op documentation marker intentionally creates a fresh push on `agent/nextjs-aws-migration`, the AWS Amplify staging branch for Aqla.

Application code was already validated by the full Next.js migration CI gate before this marker commit.

Purpose: trigger the existing Amplify auto-build/webhook for `staging.smokefreeksa.com` without changing production `main`.
