// Aqla Data Dictionary — single source of truth for every collected variable.
// Used by the admin Data Dictionary page and to inform anonymized exports.

export interface DataDictionaryEntry {
  variable: string;
  question: string;
  options: string;
  coding: string;
  required: boolean;
  source: string;
  triagePurpose: string;
  researchPurpose: string;
  inAnonymizedExport: boolean;
  section: string;
}

export const DATA_DICTIONARY: DataDictionaryEntry[] = [
  // Identifiers
  { section: "Identity", variable: "participant_code", question: "—", options: "Auto-generated (AQ-XXXXXXXX)", coding: "text", required: true, source: "Internal", triagePurpose: "Pseudonymous ID for case management", researchPurpose: "Linkage across baseline and follow-up", inAnonymizedExport: true },
  { section: "Identity", variable: "full_name", question: "Full name", options: "Free text", coding: "text", required: true, source: "Internal", triagePurpose: "Contact and identification", researchPurpose: "—", inAnonymizedExport: false },
  { section: "Identity", variable: "mobile", question: "Mobile number", options: "Phone", coding: "text", required: true, source: "Internal", triagePurpose: "Follow-up contact", researchPurpose: "—", inAnonymizedExport: false },
  { section: "Identity", variable: "email", question: "Email (optional)", options: "Email", coding: "text", required: false, source: "Internal", triagePurpose: "Optional contact", researchPurpose: "—", inAnonymizedExport: false },
  { section: "Identity", variable: "preferred_language", question: "Preferred language", options: "ar / en", coding: "enum", required: true, source: "Internal", triagePurpose: "Language of support", researchPurpose: "Language sub-analysis", inAnonymizedExport: true },
  { section: "Identity", variable: "preferred_contact", question: "Preferred contact method", options: "whatsapp / phone / sms / email", coding: "enum", required: true, source: "Internal", triagePurpose: "Channel for follow-up", researchPurpose: "Channel effectiveness analysis", inAnonymizedExport: true },

  // Demographics
  { section: "Demographics", variable: "age", question: "Age", options: "8–110", coding: "integer", required: false, source: "GATS", triagePurpose: "Age-appropriate pathway", researchPurpose: "Age stratification", inAnonymizedExport: true },
  { section: "Demographics", variable: "gender", question: "Sex / gender (optional)", options: "male / female / prefer_not", coding: "enum", required: false, source: "GATS", triagePurpose: "Pregnancy logic (female)", researchPurpose: "Sex-disaggregated analysis", inAnonymizedExport: true },
  { section: "Demographics", variable: "city", question: "City", options: "Free text", coding: "text", required: true, source: "Internal", triagePurpose: "Service routing", researchPurpose: "Geographic surveillance", inAnonymizedExport: true },
  { section: "Demographics", variable: "affiliation_type", question: "Affiliation type", options: "school / university / workplace / community", coding: "enum", required: false, source: "Internal", triagePurpose: "Setting-aware support", researchPurpose: "Setting-based prevalence", inAnonymizedExport: true },
  { section: "Demographics", variable: "school_university_workplace", question: "School / university / workplace name", options: "Free text", coding: "text", required: false, source: "Internal", triagePurpose: "Outreach coordination", researchPurpose: "Institutional analysis (aggregated)", inAnonymizedExport: false },
  { section: "Demographics", variable: "education_level", question: "Education / academic stage", options: "Free text / select", coding: "text", required: false, source: "GATS", triagePurpose: "Communication level", researchPurpose: "Socioeconomic proxy", inAnonymizedExport: true },
  { section: "Demographics", variable: "nationality", question: "Nationality (optional, admin-enabled)", options: "Free text", coding: "text", required: false, source: "GATS", triagePurpose: "—", researchPurpose: "Subgroup analysis", inAnonymizedExport: true },
  { section: "Demographics", variable: "pregnancy", question: "Are you pregnant? (if applicable)", options: "yes / no", coding: "boolean", required: false, source: "Clinical", triagePurpose: "Urgent clinician routing", researchPurpose: "Pregnancy sub-analysis", inAnonymizedExport: true },

  // Consent
  { section: "Consent", variable: "consent_assessment", question: "Consent to complete the assessment", options: "yes / no", coding: "boolean", required: true, source: "Ethics", triagePurpose: "Required for assessment", researchPurpose: "Required for data use", inAnonymizedExport: true },
  { section: "Consent", variable: "consent_contact", question: "Consent to be contacted for follow-up", options: "yes / no", coding: "boolean", required: true, source: "Ethics", triagePurpose: "Required for follow-up", researchPurpose: "Required for outcome tracking", inAnonymizedExport: true },
  { section: "Consent", variable: "consent_service_eval", question: "Consent for anonymized service evaluation", options: "yes / no", coding: "boolean", required: true, source: "Ethics", triagePurpose: "—", researchPurpose: "Service-evaluation use", inAnonymizedExport: true },
  { section: "Consent", variable: "consent_research_publication", question: "Optional consent for anonymized research/publication", options: "yes / no", coding: "boolean", required: false, source: "Ethics", triagePurpose: "—", researchPurpose: "Gates research export", inAnonymizedExport: true },

  // Product use (per product)
  { section: "Product use", variable: "products[]", question: "Which products do you currently use?", options: "cigarettes / vape / shisha / pouches / smokeless / heated / other_oral / other / multiple / former / non_user", coding: "string[]", required: true, source: "GATS/GYTS", triagePurpose: "Determines module branching", researchPurpose: "Product prevalence", inAnonymizedExport: true },
  { section: "Product use", variable: "product_use_details.ever_use", question: "Have you ever used this product?", options: "yes / no", coding: "boolean", required: false, source: "GATS", triagePurpose: "Lifetime history", researchPurpose: "Lifetime prevalence", inAnonymizedExport: true },
  { section: "Product use", variable: "product_use_details.current_use_30d", question: "Used in the past 30 days?", options: "yes / no", coding: "boolean", required: false, source: "GATS", triagePurpose: "Current use", researchPurpose: "30-day prevalence", inAnonymizedExport: true },
  { section: "Product use", variable: "product_use_details.days_used_30d", question: "On how many of the past 30 days?", options: "0–30", coding: "integer", required: false, source: "GATS", triagePurpose: "Intensity", researchPurpose: "Frequency analysis", inAnonymizedExport: true },
  { section: "Product use", variable: "product_use_details.age_first_use", question: "Age at first use", options: "5–110", coding: "integer", required: false, source: "GYTS", triagePurpose: "Youth initiation flag", researchPurpose: "Initiation age", inAnonymizedExport: true },
  { section: "Product use", variable: "product_use_details.usual_place", question: "Where do you usually use this product?", options: "home / school / café / public / other", coding: "text", required: false, source: "GATS", triagePurpose: "Context-based support", researchPurpose: "Setting analysis", inAnonymizedExport: true },
  { section: "Product use", variable: "product_use_details.family_peer_use", question: "Does family or peers also use this product?", options: "yes / no", coding: "boolean", required: false, source: "GYTS", triagePurpose: "Social context", researchPurpose: "Social determinants", inAnonymizedExport: true },
  { section: "Product use", variable: "product_use_details.ad_exposure", question: "Exposed to advertising or social media about this product?", options: "yes / no", coding: "boolean", required: false, source: "GYTS", triagePurpose: "Awareness context", researchPurpose: "Marketing exposure", inAnonymizedExport: true },

  // Cigarette module
  { section: "Cigarette module", variable: "ftnd.q1..q6", question: "Six Fagerström items", options: "Per FTND coding (0–3 / 0–1)", coding: "integer", required: false, source: "FTND", triagePurpose: "Cigarette dependence score", researchPurpose: "Validated dependence measure", inAnonymizedExport: true },
  { section: "Cigarette module", variable: "ftnd.total_score", question: "Computed total", options: "0–10", coding: "integer", required: false, source: "FTND", triagePurpose: "Cohort assignment", researchPurpose: "Dependence distribution", inAnonymizedExport: true },
  { section: "Cigarette module", variable: "cigarette_module.cigarettes_per_day", question: "Cigarettes per day", options: "0–200", coding: "integer", required: false, source: "FTND/HSI", triagePurpose: "Intensity", researchPurpose: "HSI computation", inAnonymizedExport: true },
  { section: "Cigarette module", variable: "cigarette_module.time_to_first_cig", question: "Time to first cigarette after waking", options: "≤5 / 6–30 / 31–60 / >60 min", coding: "enum", required: false, source: "FTND/HSI", triagePurpose: "Morning craving", researchPurpose: "HSI component", inAnonymizedExport: true },
  { section: "Cigarette module", variable: "cigarette_module.hsi_score", question: "Heaviness of Smoking Index", options: "0–6", coding: "integer", required: false, source: "HSI", triagePurpose: "Brief dependence measure", researchPurpose: "Surveillance metric", inAnonymizedExport: true },

  // Vape module (Nicotine Control Check)
  { section: "Vape module", variable: "nicotine_control.q1..q10", question: "10 craving/control items", options: "yes / no", coding: "boolean", required: false, source: "Nicotine Control Check (not validated PROMIS-E/Penn State)", triagePurpose: "Routing for vape users", researchPurpose: "Loss-of-control screening", inAnonymizedExport: true },
  { section: "Vape module", variable: "vape_module.days_30d", question: "Days vaped in past 30", options: "0–30", coding: "integer", required: false, source: "NYTS", triagePurpose: "Intensity", researchPurpose: "30-day frequency", inAnonymizedExport: true },
  { section: "Vape module", variable: "vape_module.times_per_day", question: "Vaping episodes per day", options: "0–200", coding: "integer", required: false, source: "NYTS", triagePurpose: "Intensity", researchPurpose: "Use frequency", inAnonymizedExport: true },
  { section: "Vape module", variable: "vape_module.time_to_first", question: "Time to first vape after waking", options: "≤5 / 6–30 / 31–60 / >60 min", coding: "enum", required: false, source: "Penn State-style", triagePurpose: "Dependence indicator", researchPurpose: "Dependence proxy", inAnonymizedExport: true },
  { section: "Vape module", variable: "vape_module.nicotine_concentration", question: "Nicotine concentration (if known)", options: "Free text", coding: "text", required: false, source: "NYTS", triagePurpose: "Exposure intensity", researchPurpose: "Exposure analysis", inAnonymizedExport: true },
  { section: "Vape module", variable: "vape_module.device_type", question: "Device type", options: "disposable / pod / refillable / unknown", coding: "enum", required: false, source: "NYTS", triagePurpose: "—", researchPurpose: "Device surveillance", inAnonymizedExport: true },
  { section: "Vape module", variable: "vape_module.flavors", question: "Flavors used", options: "Free text", coding: "text", required: false, source: "NYTS", triagePurpose: "—", researchPurpose: "Flavor surveillance", inAnonymizedExport: true },
  { section: "Vape module", variable: "vape_module.used_at_institution", question: "Used at school/university/work?", options: "yes / no", coding: "boolean", required: false, source: "GYTS", triagePurpose: "Risk context", researchPurpose: "Institutional exposure", inAnonymizedExport: true },
  { section: "Vape module", variable: "vape_module.tried_to_stop", question: "Have you tried to stop vaping?", options: "yes / no", coding: "boolean", required: false, source: "GYTS", triagePurpose: "Readiness signal", researchPurpose: "Quit intention", inAnonymizedExport: true },

  // HONC-style loss of autonomy
  { section: "HONC-style (youth)", variable: "honc_screening.q1..q10", question: "10 loss-of-autonomy items", options: "yes / no", coding: "boolean", required: false, source: "HONC-style (not validated HONC wording)", triagePurpose: "Youth dependence routing", researchPurpose: "Loss-of-autonomy screening", inAnonymizedExport: true },
  { section: "HONC-style (youth)", variable: "honc_screening.positive_count", question: "Computed positive count", options: "0–10", coding: "integer", required: false, source: "HONC-style", triagePurpose: "Severity", researchPurpose: "Population score", inAnonymizedExport: true },
  { section: "HONC-style (youth)", variable: "honc_screening.category", question: "Computed category", options: "none / low / moderate / high", coding: "enum", required: false, source: "HONC-style", triagePurpose: "Routing", researchPurpose: "Category distribution", inAnonymizedExport: true },

  // Pouch module
  { section: "Pouch module", variable: "pouch_module.days_30d", question: "Days used pouches in past 30", options: "0–30", coding: "integer", required: false, source: "NYTS", triagePurpose: "Intensity", researchPurpose: "30-day prevalence", inAnonymizedExport: true },
  { section: "Pouch module", variable: "pouch_module.pouches_per_day", question: "Pouches per day", options: "0–100", coding: "integer", required: false, source: "NYTS", triagePurpose: "Intensity", researchPurpose: "Intake analysis", inAnonymizedExport: true },
  { section: "Pouch module", variable: "pouch_module.nicotine_strength", question: "Nicotine strength (mg, if known)", options: "Free text", coding: "text", required: false, source: "NYTS", triagePurpose: "Exposure", researchPurpose: "Exposure analysis", inAnonymizedExport: true },
  { section: "Pouch module", variable: "pouch_module.wants_counseling", question: "Wants clinician counseling about pouches?", options: "yes / no", coding: "boolean", required: false, source: "Internal", triagePurpose: "Routes to clinician (no auto-recommendation)", researchPurpose: "Demand for counseling", inAnonymizedExport: true },

  // Shisha module
  { section: "Shisha module", variable: "shisha_module.sessions_per_week", question: "Shisha sessions per week", options: "0–50", coding: "integer", required: false, source: "GATS", triagePurpose: "Intensity", researchPurpose: "Frequency", inAnonymizedExport: true },
  { section: "Shisha module", variable: "shisha_module.avg_session_minutes", question: "Average session duration (min)", options: "0–600", coding: "integer", required: false, source: "GATS", triagePurpose: "Exposure", researchPurpose: "Session length", inAnonymizedExport: true },
  { section: "Shisha module", variable: "shisha_module.shared_mouthpiece", question: "Share mouthpiece?", options: "yes / no", coding: "boolean", required: false, source: "WHO", triagePurpose: "Infection risk", researchPurpose: "Public health risk", inAnonymizedExport: true },

  // Readiness & motivation
  { section: "Readiness", variable: "readiness_stage.stage", question: "What best describes you right now?", options: "quit_now / quit_prepare / reduce_first / not_ready_score / discuss_alternatives / score_only / helping_someone", coding: "enum", required: true, source: "Stages of Change", triagePurpose: "Cohort assignment", researchPurpose: "Readiness distribution", inAnonymizedExport: true },
  { section: "Motivation", variable: "motivation.importance_0_10", question: "Importance of quitting (0–10)", options: "0–10", coding: "integer", required: false, source: "NCSCT", triagePurpose: "Motivation", researchPurpose: "Motivation distribution", inAnonymizedExport: true },
  { section: "Motivation", variable: "motivation.confidence_0_10", question: "Confidence to quit (0–10)", options: "0–10", coding: "integer", required: false, source: "NCSCT", triagePurpose: "Self-efficacy", researchPurpose: "Confidence analysis", inAnonymizedExport: true },
  { section: "Motivation", variable: "motivation.barriers", question: "Main barriers", options: "cravings / stress / friends / boredom / family / study / social / withdrawal / access / mood / other", coding: "string[]", required: false, source: "NCSCT", triagePurpose: "Targeted support", researchPurpose: "Barrier mapping", inAnonymizedExport: true },

  // Quit history
  { section: "Quit history", variable: "quit_history.ever_tried", question: "Have you ever tried to quit?", options: "yes / no", coding: "boolean", required: false, source: "GATS", triagePurpose: "Experience", researchPurpose: "Quit attempt prevalence", inAnonymizedExport: true },
  { section: "Quit history", variable: "quit_history.attempts_count", question: "Number of quit attempts", options: "0–99", coding: "integer", required: false, source: "GATS", triagePurpose: "Persistence", researchPurpose: "Attempt distribution", inAnonymizedExport: true },
  { section: "Quit history", variable: "quit_history.longest_quit_duration", question: "Longest quit duration", options: "Free text / select", coding: "text", required: false, source: "NCSCT", triagePurpose: "Success indicator", researchPurpose: "Duration analysis", inAnonymizedExport: true },
  { section: "Quit history", variable: "quit_history.methods_used", question: "Methods used before", options: "unaided / counseling / app / whatsapp / NRT / medication / reduce / switch / family / other", coding: "string[]", required: false, source: "NCSCT", triagePurpose: "Plan tailoring", researchPurpose: "Method effectiveness", inAnonymizedExport: true },
  { section: "Quit history", variable: "quit_history.main_relapse_reason", question: "Main reason for relapse", options: "cravings / stress / friends / withdrawal / social / mood / weight / availability / other", coding: "enum", required: false, source: "NCSCT", triagePurpose: "Relapse prevention", researchPurpose: "Relapse driver analysis", inAnonymizedExport: true },

  // Safety flags
  { section: "Safety", variable: "safety_flags.pregnancy", question: "Pregnant?", options: "yes / no", coding: "boolean", required: false, source: "Clinical", triagePurpose: "Urgent clinician", researchPurpose: "—", inAnonymizedExport: true },
  { section: "Safety", variable: "safety_flags.severe_chest_pain", question: "Severe chest pain?", options: "yes / no", coding: "boolean", required: false, source: "Clinical", triagePurpose: "Urgent-care warning", researchPurpose: "—", inAnonymizedExport: true },
  { section: "Safety", variable: "safety_flags.severe_breathlessness", question: "Severe shortness of breath?", options: "yes / no", coding: "boolean", required: false, source: "Clinical", triagePurpose: "Urgent-care warning", researchPurpose: "—", inAnonymizedExport: true },
  { section: "Safety", variable: "safety_flags.coughing_blood", question: "Coughing blood?", options: "yes / no", coding: "boolean", required: false, source: "Clinical", triagePurpose: "Urgent-care warning", researchPurpose: "—", inAnonymizedExport: true },
  { section: "Safety", variable: "safety_flags.medication_request", question: "Requesting medication?", options: "yes / no", coding: "boolean", required: false, source: "Clinical", triagePurpose: "Routes to clinician (no auto-recommendation)", researchPurpose: "Demand signal", inAnonymizedExport: true },
  { section: "Safety", variable: "safety_flags.alt_product_request", question: "Requesting nicotine alternatives counseling?", options: "yes / no", coding: "boolean", required: false, source: "Clinical", triagePurpose: "Routes to clinician (no auto-recommendation)", researchPurpose: "Demand signal", inAnonymizedExport: true },
  { section: "Safety", variable: "safety_flags.clinician_request", question: "Wants clinician review?", options: "yes / no", coding: "boolean", required: false, source: "Internal", triagePurpose: "Routes to Cohort F", researchPurpose: "Help-seeking", inAnonymizedExport: true },

  // Cohort + research consent
  { section: "Outcome", variable: "participants.cohort", question: "Assigned cohort", options: "A / B / C / D / E / F / G / H", coding: "enum", required: true, source: "Internal", triagePurpose: "Pathway", researchPurpose: "Cohort distribution", inAnonymizedExport: true },
  { section: "Outcome", variable: "participants.doctor_review_needed", question: "Doctor review needed", options: "yes / no", coding: "boolean", required: true, source: "Internal", triagePurpose: "Routing flag", researchPurpose: "Clinical demand", inAnonymizedExport: true },
  { section: "Outcome", variable: "participants.research_consent_status", question: "Research consent status", options: "given / not_given", coding: "enum", required: true, source: "Ethics", triagePurpose: "—", researchPurpose: "Filters research export", inAnonymizedExport: true },

  // Follow-up
  { section: "Follow-up", variable: "follow_up_visits.visit_point", question: "Visit point", options: "1w / 4w / 12w / 6m / 12m", coding: "enum", required: true, source: "NCSCT/Russell", triagePurpose: "Outcome tracking", researchPurpose: "Standard follow-up schedule", inAnonymizedExport: true },
  { section: "Follow-up", variable: "follow_up_visits.abstinent", question: "Abstinent at visit?", options: "yes / no", coding: "boolean", required: false, source: "Russell Standard", triagePurpose: "Outcome", researchPurpose: "Quit rate", inAnonymizedExport: true },
  { section: "Follow-up", variable: "follow_up_visits.craving_0_10", question: "Craving severity", options: "0–10", coding: "integer", required: false, source: "NCSCT", triagePurpose: "Severity", researchPurpose: "Craving trajectory", inAnonymizedExport: true },
  { section: "Follow-up", variable: "follow_up_visits.co_reading", question: "CO reading (ppm)", options: "Numeric", coding: "numeric", required: false, source: "Russell Standard", triagePurpose: "Biochemical verification", researchPurpose: "Validated abstinence", inAnonymizedExport: true },
];
