# Quit Pathway Support

Create a real production-ready web application, not a presentation.

Project name:

La-tatten Smoking & Nicotine Cessation Support

Purpose:

Build a mobile-first bilingual Arabic/English digital tobacco and nicotine cessation triage pathway for a free physician-led support service in Saudi Arabia.

This is not a normal registration website. This is a structured clinical/public-health triage intake and support-routing platform based on established smoking cessation service models.

Core pathway:

QR code → landing page → consent → Initial Triage & Nicotine Assessment → product type → validated dependence assessment → readiness stage → automatic cohort assignment → personalized educational result → WhatsApp/email follow-up tracking → receptionist dashboard → physician escalation → CSV/anonymized export.

Technology:

Use Supabase as the backend database.

Create the frontend, database schema, scoring logic, role-based admin dashboard, and CSV export.

Important clinical design principles:

1. Do not invent random medical questionnaires.

2. Use validated or established cessation-service concepts.

3. Use Fagerström/FTND-style cigarette dependence scoring only for cigarette smokers.

4. For youth/vaping/non-cigarette nicotine use, use HONC-style loss-of-autonomy screening language rather than calling it Fagerström.

5. Separate registration from triage: the registration step must be named “Initial Triage & Nicotine Assessment.”

6. Do not recommend medications automatically.

7. Do not recommend nicotine alternatives automatically.

8. Do not provide diagnosis.

9. Route medication/NRT/alternative-product questions to clinician review.

10. Make the dependence score section visually engaging because users mainly want to know their nicotine dependence level.

Build these public user pages:

PAGE 1 — Landing Page

Create a clean healthcare-style landing page.

Include:

- Program name: La-tatten Smoking & Nicotine Cessation Support

- Arabic/English language toggle

- Simple explanation:

  “A free physician-led support pathway to help you understand your nicotine dependence and choose the right next step.”

- Main button: Start Nicotine Dependence Assessment

- Secondary text: Takes 3–5 minutes

- Disclaimer:

  “This service provides education and support. It is not an emergency service.”

- Emergency warning:

  “If you have severe chest pain, severe shortness of breath, coughing blood, or a medical emergency, seek urgent medical care.”

PAGE 2 — Consent Page

Before collecting health-related data, show consent.

Include separate checkboxes:

1. I agree to complete the nicotine assessment.

2. I agree that the team may contact me by WhatsApp/SMS/phone/email for support.

3. I understand this is educational/supportive and not emergency care.

4. I agree that my anonymized data may be used for service evaluation and improvement.

5. Optional separate checkbox: I agree that my anonymized data may be used for research/publication, if ethically approved.

If the participant is under 18, show a guardian/parent consent notice placeholder and flag the case for admin review.

PAGE 3 — Initial Triage & Nicotine Assessment

This is both registration and triage.

Collect:

- Auto-generated Participant ID

- Full name

- Mobile number

- Email optional

- Age

- Date of birth optional

- Gender optional

- City

- School/university/workplace

- Preferred language: Arabic / English

- Preferred contact method: WhatsApp / phone call / SMS / email

- Is the participant completing this for themselves? yes/no

- Has the participant previously tried to quit? yes/no

- Number of previous quit attempts: 0 / 1 / 2–3 / more than 3

- Main reason for using the service:

  a. I want to know my nicotine dependence score

  b. I want to quit completely

  c. I want to reduce

  d. I am worried about my health

  e. My family/school advised me

  f. I want to discuss alternatives with a clinician

  g. Other

PAGE 4 — Product Type Selection

Question:

“What nicotine or tobacco products do you currently use?”

Allow multiple selections:

- Cigarettes

- Vape/e-cigarette

- Shisha/hookah

- Nicotine pouches

- Smokeless tobacco

- More than one product

- I used before but stopped

- I do not currently use but I want to understand my risk

Store all selected products.

Branch logic:

- If cigarettes selected: show Cigarette Dependence Score section.

- If vape/e-cigarette/nicotine pouches selected: show Nicotine Control / Loss of Control section.

- If multiple products: show both cigarette section if cigarettes selected and nicotine-control section.

- If no current use: skip dependence score and show prevention/education pathway.

PAGE 5 — Cigarette Dependence Score

Only show this if cigarettes are selected.

Title:

“Cigarette Dependence Score”

Subtitle:

“This section estimates how strongly your body may depend on cigarettes. Your score is not a judgment. It helps us choose the right support pathway.”

Use the 6 standard Fagerström Test for Nicotine Dependence / Fagerström Test for Cigarette Dependence domains:

1. Time to first cigarette after waking

2. Difficulty refraining from smoking where smoking is not allowed

3. Cigarette hardest to give up

4. Number of cigarettes per day

5. Smoking more frequently during the first hours after waking

6. Smoking even when ill in bed

Create scoring from 0 to 10.

Dependence categories:

0–2 = Very low cigarette dependence

3–4 = Low cigarette dependence

5 = Moderate cigarette dependence

6–7 = High cigarette dependence

8–10 = Very high cigarette dependence

Show result in a large card:

“Your cigarette dependence score is X/10.”

Add explanation:

“This score helps us understand how much support you may need. It does not define you and it is not a diagnosis.”

PAGE 6 — Nicotine Control / Loss-of-Control Section

Show this if vape/e-cigarette/nicotine pouches/smokeless tobacco/multiple products are selected.

Do not call this Fagerström.

Title:

“Nicotine Control Check”

Subtitle:

“This checks whether nicotine is starting to control your routine, mood, or ability to stop.”

Ask yes/no questions based on loss-of-control concepts:

- Have you ever tried to stop using nicotine but found that you could not?

- Do you feel strong cravings or urges to use nicotine?

- Do you feel nervous, restless, anxious, or irritable when you cannot use nicotine?

- Do you use nicotine soon after waking?

- Do you find it difficult not to use nicotine at school, university, work, or other restricted places?

- Do you feel you need nicotine to concentrate, relax, or feel normal?

- Have you increased the amount or frequency of nicotine use over time?

- Do you continue using nicotine even when you are worried about your health?

- Do you feel addicted or controlled by nicotine?

- Would stopping nicotine feel very difficult for you right now?

Score:

Count yes responses.

Risk categories:

0 yes = Low current concern

1–2 yes = Early loss-of-control concern

3–5 yes = Moderate nicotine-control concern

6+ yes = High nicotine-control concern / clinician review recommended

If age under 18 and any yes response, add youth support flag.

PAGE 7 — Readiness Stage

Show after dependence/control scoring.

Question:

“What best describes you today?”

Options:

1. I want to quit completely now

2. I want to quit, but I need help preparing

3. I want to reduce first

4. I am not ready to quit, but I want to understand my dependence

5. I want to discuss nicotine alternatives with a clinician

6. I only want my score today

7. I am helping someone else

Store readiness stage.

PAGE 8 — Risk Flags / Safety Screen

Ask:

“Do any of the following apply to you?”

Options:

- Age under 18

- Pregnancy

- Severe chest pain

- Severe shortness of breath

- Coughing blood

- Severe withdrawal symptoms

- Mental-health concern or severe anxiety/depression

- Repeated failed quit attempts

- Using multiple nicotine products

- Very high cigarette dependence score

- Wants medication or nicotine replacement therapy

- Wants to discuss nicotine alternatives

- Requests clinician review

Logic:

If chest pain, severe shortness of breath, or coughing blood is selected, show urgent-care message.

If any clinical risk flag is selected, mark Doctor Review Needed = yes.

PAGE 9 — Automatic Cohort Assignment

Automatically assign each participant to one primary cohort.

Cohort A:

Cigarette smoker, FTND 0–4, ready to quit or prepare.

Action: self-guided quit plan + automated follow-up.

Cohort B:

Cigarette smoker, FTND ≥5, ready to quit or prepare.

Action: priority structured support + receptionist follow-up + possible physician review.

Cohort C:

Vape/e-cigarette/nicotine pouch user with moderate/high nicotine-control concern.

Action: youth-friendly nicotine support pathway + follow-up.

Cohort D:

Not ready to quit.

Action: motivational support pathway, no pressure, offer return later.

Cohort E:

Wants clinician counseling about alternatives.

Action: clinician review required. Do not recommend alternatives automatically.

Cohort F:

High-priority doctor review.

Criteria: urgent symptom flag, age under 18 with dependence concern, pregnancy, very high dependence, mental-health concern, multiple products, repeated failed attempts, medication/NRT request.

Action: doctor review queue.

Cohort G:

Score-only user.

Action: show result and invite follow-up later.

Cohort H:

No current use / prevention pathway.

Action: prevention education and optional resources.

Store cohort, reason for cohort, and doctor_review_needed boolean.

PAGE 10 — Personalized Result Page

Show after submission.

Display:

- Participant ID

- Product type

- Cigarette dependence score if applicable

- Nicotine Control score if applicable

- Dependence/risk category

- Readiness stage

- Assigned support pathway

- Doctor review status if applicable

Use large visual cards.

Example result message:

“Your score is X. This does not judge you. It helps us understand what level of support may fit you best.”

For low dependence:

“You may benefit from a structured quit plan, trigger awareness, and short follow-up messages.”

For moderate/high dependence:

“You may benefit from more structured support. A team member may contact you according to your preferred method.”

For not ready:

“You do not have to decide today. We can send supportive information and you can return when ready.”

For alternatives:

“Because nicotine alternatives and medications require individualized counseling, your request will be routed to clinician review.”

Buttons:

- Request follow-up

- Save my result

- Return later

- Download result summary PDF

- Back to home

PAGE 11 — Follow-up Preference

Ask:

“How would you like us to support you?”

Options:

- WhatsApp educational messages

- Phone call from receptionist

- Physician review if needed

- Email only

- No contact now

Store follow-up preference.

Admin system requirements:

ADMIN LOGIN

Create secure admin login using Supabase Auth.

Roles:

1. Receptionist

2. Physician/Admin

Receptionist permissions:

Can view:

- Participant ID

- Name

- Mobile

- Preferred contact method

- Age group

- Product type

- Cohort

- Follow-up status

- Doctor review needed yes/no

- Appointment requested yes/no

Can update:

- Contacted yes/no

- Contact date

- Follow-up status

- Appointment requested

- Receptionist notes

- Escalate to doctor yes/no

Physician/Admin permissions:

Can view all data.

Can update:

- Clinical notes

- Risk review

- Follow-up level

- Outcome status

- Quit attempt status

- 4-week outcome

- 12-week outcome

- 6-month outcome

- 12-month outcome

Can export data.

ADMIN DASHBOARD

Create dashboard cards:

- Total participants

- New submissions today

- Participants by cohort

- Participants needing doctor review

- Participants by product type

- Participants by cigarette dependence category

- Participants by nicotine control category

- Participants by readiness stage

- Follow-up pending

- Contacted

- Appointment requested

- 4-week follow-up due

- 12-week follow-up due

Filters:

- Name

- Phone

- Participant ID

- City

- School/university/workplace

- Product type

- Score category

- Readiness stage

- Cohort

- Doctor review needed

- Follow-up status

- Date submitted

EXPORT

Add export buttons for physician/admin:

1. Export full CSV

2. Export anonymized CSV without name, phone, email

3. Export filtered cohort CSV

4. Export follow-up due list CSV

5. Export research/service-evaluation dataset

FOLLOW-UP OUTCOMES

Add structured outcome tracking:

- Baseline submission date

- Quit date if selected

- 1-week follow-up status

- 4-week status

- 12-week status

- 6-month status

- 12-month status

- Current product use

- Abstinent yes/no

- Reduced use yes/no

- Relapsed yes/no

- Lost to follow-up yes/no

- Optional CO reading field if available later

DATABASE TABLES

Create Supabase tables:

1. participants

2. consent_records

3. product_use

4. cigarette_dependence_scores

5. nicotine_control_scores

6. readiness_stage

7. risk_flags

8. cohort_assignment

9. follow_up_preferences

10. follow_up_records

11. admin_users

12. clinical_notes

13. outcome_tracking

14. audit_log

15. export_logs

DATA SAFETY

Add:

- Row-level security

- Role-based permissions

- Audit log for admin views/edits

- Created_at and updated_at timestamps

- Participant ID separate from identifiable data

- Anonymized export option

- No public access to database

- No exposure of participant records to other participants

DESIGN

Use:

- White background

- Green/blue healthcare accents

- Mobile-first design

- Large simple buttons

- Clear progress bar

- Friendly youth-appropriate tone

- Professional but not intimidating

- Arabic/English language toggle

- Simple Saudi Arabic translation

- Avoid dark theme

- Avoid complicated medical language

Progress bar:

1. Consent

2. Triage

3. Product Type

4. Dependence Score

5. Readiness

6. Result

Arabic support:

Build the app so all public pages can switch between English and Arabic.

Use simple Arabic.

Do not use overly formal language.

Keep medical terms understandable.

Safety wording:

Do not say “treatment prescribed.”

Do not say “we recommend medication.”

Use “support pathway,” “clinician review,” “educational guidance,” and “follow-up.”

Final instruction:

Build the first complete working version now with real forms, scoring logic, cohort logic, Supabase backend, admin dashboard, role-based access, and CSV export.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://aqla-support.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/01a2dd9d-1d2b-44b0-a6e8-2ba83e370119).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
