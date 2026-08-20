# Aqla OS + Personal Digital Twin — Constitutional Product Specification

Status: authoritative staging specification. This document governs future Aqla OS work unless the product owner explicitly changes it.

## 1. Product definition

Aqla — أقلع is to evolve from a conventional cessation website into one AI-assisted operating system for smoking and nicotine cessation, powered by a longitudinal behavioural Personal Digital Twin.

The participant should experience one intelligent Aqla environment, not a collection of disconnected pages. The conversational interface is the operating layer. Assessment, quit plans, cravings, challenges, games, education, follow-up, progress, relapse recovery and communications are capabilities that Aqla invokes when needed.

The core promise is: Aqla knows where the participant is in the journey, remembers authorised relevant state, understands what has and has not worked, and brings the right trusted capability at the right time.

## 2. Immutable research entry experience

The first-ever Aqla research experience is protected.

Do not replace or visually redesign the existing approved research-first page without explicit product-owner instruction.

Preserve:
- existing research-first gateway;
- existing red research banner;
- existing study participation path;
- ability to skip research and receive cessation support;
- existing Aqla logo, typography, spacing and visual hierarchy;
- existing Arabic-first RTL and English LTR behaviour.

Required journey:

FIRST VISIT → EXISTING RESEARCH PAGE + RED RESEARCH BANNER → PARTICIPATE OR SKIP → AQLA OS.

Research participation is optional and must never block cessation support.

## 3. Immutable visual identity

Functionality may evolve. The approved Aqla visual identity must not be replaced, diluted or independently redesigned without explicit instruction.

The existing Lovable Aqla visual language is the visual source of truth.

Preserve:
- deep near-black / Saudi-green environment;
- approximately #020806 background family;
- Saudi green #006C35 and accent green #00A65A family;
- restrained gold #C9A84C accents;
- cream/ivory highlights;
- translucent premium glass surfaces;
- subtle borders and shadows;
- established logo treatment;
- professional healthcare/university-grade appearance;
- Arabic-first RTL, first-class English LTR;
- strong mobile responsiveness and accessibility.

Do not introduce a separate generic SaaS design system, childish gamification, random colours, or a visual clone of ChatGPT. ChatGPT is an interaction-usability reference, not a visual design reference.

Apply a zero-embarrassment test to every participant, clinician, admin, research, email, PDF and communications surface.

## 4. Aqla OS interaction shell

After the research gateway, the primary experience should become a simplified conversational workspace with:
- conversation/history sidebar or RTL-equivalent;
- main conversation canvas;
- bottom composer;
- Aqla mode selector;
- suggested actions;
- microphone/voice input where supported;
- dynamically rendered Aqla cards/tools.

Users should be able to say naturally:
- I want to quit;
- build my quit plan;
- I am craving;
- I smoked again;
- I do not feel ready;
- give me today's challenge;
- show my progress;
- email me my plan;
- remind me tomorrow;
- teach me about nicotine pouches.

Aqla should bring the correct capability into the conversation instead of asking the user to navigate to the correct page.

## 5. Four operating modes

The mode selector contains four conceptual environments:

1. Aqla Quit — أقلع للأفراد
2. Aqla Academy — أكاديمية أقلع
3. Clinician Portal — بوابة الممارس
4. Admin Portal — بوابة الإدارة

These are not four prompts. They have different permissions, data access and tools.

Participants may use Aqla Quit and Aqla Academy. Clinician and Admin access must be enforced server-side using authenticated roles. URL or prompt manipulation must never grant elevated access.

## 6. Personal Digital Twin

Initially define the twin as a continuously updated structured representation of the participant's nicotine-use patterns, triggers, goals, behavioural responses and quitting journey used to personalise Aqla support over time.

Do not claim physiological simulation or medical-outcome prediction without scientific validation.

The authoritative twin lives in Aqla's structured data layer, not in LLM memory.

Initial twin domains may include:
- language and communication preferences;
- nicotine products, primary product, mixed use and frequency;
- dependence indicators;
- triggers and routines;
- readiness, importance and confidence;
- personal reasons and goal;
- previous attempts, longest abstinence and relapse causes;
- current plan, stage, challenges and completed actions;
- craving/slip/relapse history;
- follow-up outcomes and trends;
- support/referral state;
- Academy learning state.

Maintain provenance, timestamps and schema versions for important longitudinal state.

## 7. AI architecture

OpenAI is a major conversational orchestration and personalisation layer, but does not replace Aqla's deterministic clinical/safety engine.

Architecture:

USER → AQLA CONVERSATIONAL ORCHESTRATOR → RELEVANT TWIN CONTEXT → AUTHORISATION / CONSENT / SAFETY → TRUSTED AQLA TOOL → DETERMINISTIC CLINICAL RULES WHERE APPLICABLE → PERSONALISED RESPONSE.

OpenAI may:
- understand intent;
- ask only missing questions;
- choose from authorised tools;
- personalise language and coaching;
- summarise patterns;
- personalise behavioural strategies and challenges;
- personalise plan explanation and approved plan content;
- adapt tone to readiness/confidence;
- generate user and clinician summaries using permitted data;
- orchestrate approved actions.

OpenAI is not authoritative for:
- validated scores;
- HSI calculation;
- safety flags;
- emergency escalation;
- referral requirements;
- diagnosis;
- medication prescription/dose;
- permissions/authentication;
- consent;
- data retention.

AI failure must not break core Aqla functions.

## 8. Deeper plan personalisation

Do not restrict AI to one summary and one micro-challenge. Once deterministic safety and pathway decisions are locked, allow bounded personalisation of:
- explanation of nicotine pattern;
- why the pathway fits;
- first 24 hours;
- 72-hour support;
- first-week plan;
- trigger strategies;
- craving scripts;
- environmental/social strategies;
- motivation;
- support-person message;
- relapse recovery;
- quit-now/reduction/preparation pathways;
- mixed-use prioritisation;
- daily challenges;
- learning recommendations;
- follow-up coaching;
- progress summaries.

## 9. Follow-up architecture

Day 3 / Day 7 / Day 30 is an MVP scaffold, not the final standard.

Aqla should support a flexible longitudinal backbone aligned with current cessation guidance and research standards. Candidate support/outcome points include:

Day 0, Day 1, Day 3, Day 7, Day 14, Day 21, Day 28/30, Day 60, Day 90, Month 6 and Month 12.

Do not blindly hard-code a cadence without evidence review. Clearly separate support contacts from formal research/outcome assessments.

The twin may trigger additional support after slips, relapse, escalating cravings, reduced confidence, repeated challenge failure, successful milestones, disengagement, change in product use, or explicit user request.

Respect notification preferences, quiet hours and reasonable frequency limits.

## 10. Research-grade outcomes

Where protocol and consent allow, support clearly defined outcomes such as:
- 7-day point-prevalence abstinence;
- 30-day point-prevalence abstinence;
- continuous/prolonged abstinence where defined;
- reduction;
- product switching/mixed use;
- quit attempts;
- slips/relapse;
- craving/confidence trends;
- support utilisation;
- satisfaction and engagement.

Do not confuse engagement with cessation outcome. A challenge completion is not a quit. A sent follow-up is not a completed outcome.

Preserve REDCap/research-system separation where required. Never silently convert support data into research data without appropriate governance.

## 11. Challenges and mature gamification

Challenges may include craving delay, nicotine-free mornings, coffee/drive/social trigger challenges, streaks, money-saved milestones, trigger identification, refusal rehearsal, craving timer, relapse recovery and Academy knowledge checks.

Do not use manipulative or shame-based gamification. A slip does not erase progress.

## 12. Voice and multimodal UX

Design the composer for text, microphone/voice input, and later appropriate attachments/images. Do not store raw audio unnecessarily. Obtain appropriate consent before recording or analysing voice. Voice input must not weaken safety boundaries.

## 13. Academy

Academy uses the same Aqla OS shell. It should support conversational microlearning, evidence-based education, quizzes, knowledge checks and personalised learning. Do not fabricate accreditation, CPD status or certificates.

## 14. Clinician Portal

With appropriate consent and permissions, clinicians should receive structured longitudinal views rather than raw chat logs. Potential views include nicotine state, dependence indicators, current plan, readiness/confidence trends, follow-up outcomes, slips/relapse, challenge engagement, referral state and concise AI-assisted summaries. Distinguish observed data from AI interpretation.

## 15. Admin Portal + KPI Command Centre

Admin must include a professional analytics command centre using real data only.

Each KPI must define its numerator/denominator where relevant, time window, data source, last-updated time and filter state. Distinguish unique users from events and sent/delivered/responded/completed states.

Core metric families:

### Traffic
- visits;
- unique visitors;
- new/returning visitors;
- sessions;
- entry-to-Aqla conversion;
- research-banner interactions;
- study click-through;
- skip-to-support click-through.

Do not claim REDCap completion unless Aqla receives a valid completion signal.

### Accounts
- registrations;
- verified accounts;
- active users;
- DAU/WAU/MAU;
- returning users.

### Assessment
- started/completed;
- completion rate;
- median completion time;
- stage drop-off.

### Quit plans
- generated;
- persisted;
- unique users receiving plans;
- regenerated;
- downloaded PDF;
- emailed;
- delivery success/failure.

### Follow-up
For every configured timepoint show eligible, scheduled, sent, delivered where known, started, completed, missed, rescheduled, failed, channel and outcome captured.

### Challenges
Offered, accepted, started, completed, declined, repeat attempts and twin-triggered challenges.

### Craving/relapse support
Craving sessions, slip recovery, relapse recovery, urgent support, professional support recommendations and safety escalations.

### Academy
Learning sessions, modules viewed/completed, quizzes, educational conversations and return-to-learning rate.

### AI
Conversations, messages, unique AI users, tool calls, successful/failed tool calls, fallback rate, structured-output failures, safety interventions, latency, model usage, token consumption and estimated cost.

### Communications
Email queued/sent/delivered/bounced/complained/failed/responded where supported. WhatsApp after official integration: eligible/opted-in, queued, sent, delivered, read where permitted, responded, failed and template/category metadata.

If a metric is unavailable, show Not available, not zero and never fabricate a number.

The Admin Portal must use the same Aqla green/gold visual language.

## 16. Email and WhatsApp orchestration

OpenAI interprets communication requests, but never directly sends messages.

Flow:

USER → AI INTENT → AUTH / CONSENT / SAFETY / CHANNEL POLICY → TRUSTED SEND/SCHEDULE TOOL → AWS/COMMUNICATION PROVIDER → RESULT → CONVERSATION.

Examples:
- email my plan;
- remind me tomorrow;
- check on me after work;
- send my next challenge on WhatsApp after WhatsApp is officially integrated.

Maintain structured communication preferences including channel enablement, language, preferred channel, allowed times/timezone, frequency and consent version.

Never let AI override an opt-out. Never send WhatsApp merely because a phone number exists.

Avoid unnecessary health details in email/WhatsApp previews.

## 17. Security, privacy and safety

Use data minimisation. Do not send unnecessary identity data to OpenAI. Prefer structured relevant context over complete raw history.

Maintain authentication, server-side authorisation, secure cookies, CSRF protection, private/no-store health responses, request-size limits, safe telemetry, structured logging, rate limits where appropriate and auditability.

Do not put sensitive health state into URLs where avoidable.

Safety escalation must not depend solely on an LLM. Maintain deterministic detection and escalation, with AI semantic detection as an additional layer.

## 18. AWS foundation

Build on the existing staging AWS foundation rather than discarding it:
- Next.js;
- AWS Amplify;
- Cognito;
- DynamoDB;
- SES;
- Secrets Manager;
- EventBridge Scheduler architecture;
- server-side OpenAI Responses API integration;
- deterministic quit engine;
- authenticated plan ownership;
- existing security hardening.

Keep secrets server-side.

## 19. Production safety

Do not modify live Lovable production during staging development. Do not merge main merely to test. Preserve rollback and validate design, mobile, Arabic RTL, security, clinical behaviour, communications and follow-up before cutover.

## 20. Memory model

Keep separate:
A. raw conversation history;
B. long-term Aqla memory;
C. structured Personal Digital Twin;
D. clinical/safety state.

Do not repeatedly send entire chat history to the model. Use bounded recent context plus structured summaries/retrieval.

## 21. Tool model

Build Aqla as an orchestrator over typed trusted tools, conceptually including:
- assessment;
- quit plan;
- digital twin;
- craving support;
- relapse recovery;
- challenge;
- follow-up;
- progress;
- Academy;
- safety;
- referral;
- communication;
- clinician summary;
- research.

Validate tool inputs/outputs. LLMs do not write arbitrary health records or permissions directly.

## 22. Versioning and governance

Version assessment schema, clinical rules, safety rules, scoring logic, plan generator, AI prompts, model, challenge library, follow-up schedule, consent, research mappings and twin schema.

## 23. Delivery strategy

Build in coherent vertical slices. First priority is one excellent conversational Aqla Quit OS:

research gateway → conversational Aqla OS → assessment/intent routing → deterministic clinical engine → deeper AI personalisation → twin creation/update → saved conversation → craving support → challenge → adaptive follow-up → returning-user continuity.

Only then expand breadth.

For every capability distinguish:
- CODED;
- DEPLOYED;
- RUNTIME VERIFIED;
- END-TO-END VERIFIED.

Compilation is not runtime verification.

## 24. Final principle

The AI provides intelligence and personalisation.
The Personal Digital Twin provides longitudinal understanding.
The Aqla engine provides clinical and behavioural rules.
The tool system provides actions.
AWS provides infrastructure and persistence.
The conversational UI provides simplicity.
Clinical governance provides safety.
Research architecture provides scientific legitimacy.
The existing Aqla visual design provides identity.

Goal: the simplest possible participant experience built on top of a deeply sophisticated, safe, auditable and research-grade system.
