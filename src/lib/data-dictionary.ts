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
  // Extended research-grade metadata (optional for backward compatibility)
  table_name?: string;
  export_file?: string;
  question_text_ar?: string;
  question_text_en?: string;
  response_options?: string;
  branching_rule?: string;
  source_framework?: string;
  included_in_full_export?: boolean;
  included_in_anonymized_export?: boolean;
  included_in_research_export?: boolean;
  identifiable_or_sensitive?: boolean;
  missing_value_codes?: string;
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

  // ===== Research-grade export variables (item-level + long-format) =====
  ...((): DataDictionaryEntry[] => {
    const ftndItems = [
      { name: "ftnd_item_1_time_to_first_cigarette", ar: "بعد كم من الوقت من الاستيقاظ تدخّن أول سيجارة؟", en: "How soon after waking do you smoke your first cigarette?", opts: "≤5 / 6–30 / 31–60 / >60 min" },
      { name: "ftnd_item_2_difficulty_refraining", ar: "هل تجد صعوبة في الامتناع عن التدخين في الأماكن الممنوعة؟", en: "Do you find it difficult to refrain from smoking in places where it is forbidden?", opts: "yes / no" },
      { name: "ftnd_item_3_hardest_cigarette_to_give_up", ar: "أي سيجارة يصعب التخلي عنها أكثر؟", en: "Which cigarette would you hate most to give up?", opts: "first one in the morning / any other" },
      { name: "ftnd_item_4_cigarettes_per_day", ar: "كم سيجارة تدخّن يومياً؟", en: "How many cigarettes per day?", opts: "≤10 / 11–20 / 21–30 / ≥31" },
      { name: "ftnd_item_5_smoke_more_in_morning", ar: "هل تدخّن أكثر في الصباح؟", en: "Do you smoke more in the morning?", opts: "yes / no" },
      { name: "ftnd_item_6_smoke_when_ill", ar: "هل تدخّن حتى عندما تكون مريضاً في الفراش؟", en: "Do you smoke even when ill in bed?", opts: "yes / no" },
    ];
    return ftndItems.map((i) => ({
      section: "Export: dependence_items",
      variable: i.name, question: i.en, options: i.opts,
      coding: "labelled + integer score", required: false,
      source: "FTND", triagePurpose: "Cigarette dependence component",
      researchPurpose: "Item-level Fagerström analysis", inAnonymizedExport: true,
      table_name: "cigarette_dependence_scores", export_file: "dependence_items",
      question_text_ar: i.ar, question_text_en: i.en, response_options: i.opts,
      branching_rule: "asked only if products includes cigarettes",
      source_framework: "FTND (Fagerström)",
      included_in_full_export: true, included_in_anonymized_export: true,
      included_in_research_export: true, identifiable_or_sensitive: false,
      missing_value_codes: "not_applicable / not_answered",
    }));
  })(),

  ...((): DataDictionaryEntry[] => {
    const items: Array<[string, string, string]> = [
      ["nic_control_item_1_tried_to_stop_could_not", "حاولت التوقف ولم تستطع", "Tried to stop but could not"],
      ["nic_control_item_2_strong_cravings", "رغبة شديدة (اشتهاء) للنيكوتين", "Strong cravings for nicotine"],
      ["nic_control_item_3_withdrawal_mood_symptoms", "أعراض انسحاب أو تغيّر مزاج عند التوقف", "Withdrawal or mood symptoms when stopping"],
      ["nic_control_item_4_use_soon_after_waking", "تستخدم النيكوتين بعد الاستيقاظ بفترة قصيرة", "Use nicotine soon after waking"],
      ["nic_control_item_5_difficult_in_restricted_places", "صعوبة في الامتناع في الأماكن الممنوعة", "Difficult to abstain in restricted places"],
      ["nic_control_item_6_need_to_concentrate_or_feel_normal", "تحتاجه للتركيز أو للشعور بأنك طبيعي", "Need it to concentrate or feel normal"],
      ["nic_control_item_7_increased_use_over_time", "زاد استخدامك مع الوقت", "Increased use over time"],
      ["nic_control_item_8_continued_despite_health_concern", "استمررت رغم القلق الصحي", "Continued despite a health concern"],
      ["nic_control_item_9_feels_addicted_or_controlled", "تشعر أنك مدمن أو يتحكم بك", "Feel addicted or controlled by it"],
      ["nic_control_item_10_stopping_feels_difficult", "التوقف يبدو صعباً", "Stopping feels difficult"],
    ];
    return items.map(([name, ar, en]) => ({
      section: "Export: dependence_items",
      variable: name, question: en, options: "yes / no",
      coding: "boolean → yes/no/not_answered", required: false,
      source: "Nicotine Control Check (Aqla)",
      triagePurpose: "Loss-of-control screening for non-cigarette nicotine users",
      researchPurpose: "Item-level loss-of-control distribution",
      inAnonymizedExport: true,
      table_name: "nicotine_control_scores", export_file: "dependence_items",
      question_text_ar: ar, question_text_en: en, response_options: "yes / no",
      branching_rule: "asked when participant uses vape / pouches / shisha / smokeless / multiple",
      source_framework: "Aqla Nicotine Control Check (not validated PROMIS-E / Penn State)",
      included_in_full_export: true, included_in_anonymized_export: true,
      included_in_research_export: true, identifiable_or_sensitive: false,
      missing_value_codes: "not_applicable / not_answered",
    }));
  })(),

  ...((): DataDictionaryEntry[] => {
    const items: Array<[string, string, string]> = [
      ["honc_style_q1_tried_quit_failed", "حاولت الإقلاع وفشلت", "Tried to quit and failed"],
      ["honc_style_q2_strong_cravings", "اشتهاء قوي", "Strong cravings"],
      ["honc_style_q3_felt_addicted", "شعرت أنك مدمن", "Felt addicted"],
      ["honc_style_q4_hard_in_restricted", "صعوبة في الأماكن الممنوعة", "Hard in restricted places"],
      ["honc_style_q5_withdrawal", "أعراض انسحاب", "Withdrawal symptoms"],
      ["honc_style_q6_needed_to_feel_normal", "احتجته للشعور بالطبيعية", "Needed it to feel normal"],
      ["honc_style_q7_increased_use", "زاد الاستخدام", "Increased use"],
      ["honc_style_q8_felt_controlled", "شعرت أنه يتحكم بك", "Felt controlled by it"],
      ["honc_style_q9_continued_despite_health", "تابعت رغم القلق الصحي", "Continued despite health concern"],
      ["honc_style_q10_stopping_difficult", "صعوبة في التوقف", "Stopping difficult"],
    ];
    return items.map(([name, ar, en]) => ({
      section: "Export: dependence_items",
      variable: name, question: en, options: "yes / no",
      coding: "boolean → yes/no/not_answered", required: false,
      source: "HONC-style", triagePurpose: "Youth loss-of-autonomy screening",
      researchPurpose: "Population loss-of-autonomy distribution", inAnonymizedExport: true,
      table_name: "honc_screening", export_file: "dependence_items",
      question_text_ar: ar, question_text_en: en, response_options: "yes / no",
      branching_rule: "optional youth/HONC extension",
      source_framework: "HONC-style (not validated HONC wording)",
      included_in_full_export: true, included_in_anonymized_export: true,
      included_in_research_export: true, identifiable_or_sensitive: false,
      missing_value_codes: "not_applicable / not_answered",
    }));
  })(),

  ...((): DataDictionaryEntry[] => {
    const vars: Array<[string, string, string, string, string]> = [
      ["product_type", "نوع المنتج", "Product type", "cigarettes / vape/e-cigarette / shisha/hookah / nicotine_pouches / smokeless_tobacco / heated_tobacco / other", "enum"],
      ["ever_use", "هل استخدمت هذا المنتج من قبل؟", "Have you ever used this product?", "yes / no", "yes/no/not_answered"],
      ["current_use_past_30_days", "استخدمته خلال آخر ٣٠ يوم؟", "Used in the past 30 days?", "yes / no", "yes/no/not_answered"],
      ["days_used_past_30_days", "عدد الأيام في آخر ٣٠ يوماً", "Days used in past 30 days", "0–30", "integer"],
      ["age_first_use", "العمر عند أول استخدام", "Age at first use", "5–110", "integer"],
      ["age_regular_use", "العمر عند الاستخدام المنتظم", "Age at regular use", "5–110", "integer"],
      ["main_product_yes_no", "هل هذا منتجك الأساسي؟", "Is this your main product?", "yes / no", "yes/no/not_answered"],
      ["usual_place_of_use", "المكان المعتاد", "Usual place of use", "home / café / public / school / other", "text"],
      ["source_of_product", "مصدر المنتج", "Source of product", "shop / friend / family / online / other", "text"],
      ["use_at_school_university_work", "تستخدمه في المدرسة/الجامعة/العمل؟", "Used at school / university / work?", "yes / no", "yes/no/not_answered"],
      ["family_member_uses_product", "هل يستخدم أحد العائلة هذا المنتج؟", "Family member uses this product?", "yes / no", "yes/no/not_answered"],
      ["social_media_or_ad_exposure", "تعرّضت لإعلانات على وسائل التواصل؟", "Social media or ad exposure?", "yes / no", "yes/no/not_answered"],
      ["cigarettes_per_day", "عدد السجائر يومياً", "Cigarettes per day", "0–200", "integer (cigarettes only)"],
      ["times_per_day", "مرّات الاستخدام يومياً (فيب)", "Vape episodes per day", "0–200", "integer (vape only)"],
      ["pouches_per_day", "أكياس يومياً", "Pouches per day", "0–100", "integer (pouches only)"],
      ["sessions_per_week", "جلسات الشيشة أسبوعياً", "Shisha sessions per week", "0–50", "integer (shisha only)"],
      ["average_session_duration_minutes", "متوسط مدة الجلسة (د)", "Average session duration (min)", "0–600", "integer (shisha only)"],
      ["time_to_first_use_after_waking", "الوقت إلى أول استخدام بعد الاستيقاظ", "Time to first use after waking", "≤5 / 6–30 / 31–60 / >60 min", "enum"],
      ["device_type", "نوع جهاز الفيب", "Vape device type", "disposable / pod / refillable / unknown", "enum (vape only)"],
      ["disposable_or_refillable_or_pod", "نمط الجهاز", "Disposable / refillable / pod", "free text", "text (vape only)"],
      ["nicotine_concentration", "تركيز النيكوتين (فيب)", "Nicotine concentration (vape)", "free text", "text (vape only)"],
      ["nicotine_strength", "قوة النيكوتين (أكياس)", "Nicotine strength (pouches)", "free text", "text (pouches only)"],
      ["flavor_type", "النكهة", "Flavor type", "free text", "text"],
      ["shared_mouthpiece", "مشاركة قطعة الفم", "Shared mouthpiece (shisha)", "yes / no", "yes/no/not_answered"],
      ["tobacco_or_nicotine_type", "نوع التبغ/النيكوتين", "Tobacco/nicotine type (shisha)", "free text", "text"],
      ["used_with_other_products", "يُستخدم مع منتجات أخرى؟", "Used with other products?", "yes / no", "yes/no/not_answered"],
      ["hsi_score", "مؤشر شدة التدخين", "Heaviness of Smoking Index", "0–6", "integer (cigarettes only)"],
      ["tried_to_stop", "حاولت التوقف عن هذا المنتج؟", "Tried to stop this product?", "yes / no", "yes/no/not_answered"],
      ["wants_clinician_counseling", "ترغب باستشارة طبية؟", "Wants clinician counseling?", "yes / no", "yes/no/not_answered (pouches)"],
      ["quit_interest", "اهتمامك بالإقلاع", "Quit interest", "free text", "text (shisha)"],
    ];
    return vars.map(([name, ar, en, opts, coding]) => ({
      section: "Export: product_use",
      variable: name, question: en, options: opts, coding,
      required: false, source: "GATS/GYTS/NYTS",
      triagePurpose: "Per-product intensity & context",
      researchPurpose: "Per-product prevalence and item-level analysis",
      inAnonymizedExport: true,
      table_name: "product_use_details / cigarette_module / vape_module / pouch_module / shisha_module",
      export_file: "product_use",
      question_text_ar: ar, question_text_en: en, response_options: opts,
      branching_rule: "only emitted for products the participant reports using",
      source_framework: "GATS / GYTS / NYTS / FTND",
      included_in_full_export: true, included_in_anonymized_export: true,
      included_in_research_export: true, identifiable_or_sensitive: false,
      missing_value_codes: "not_applicable / not_answered",
    }));
  })(),

  ...((): DataDictionaryEntry[] => {
    const vars: Array<[string, string, string, string, string]> = [
      ["readiness_stage", "أي وصف يناسبك الآن؟", "Which best describes you right now?", "quit_now / quit_prepare / reduce_first / not_ready_score / discuss_alternatives / score_only / helping_someone", "enum"],
      ["importance_to_quit_0_10", "أهمية الإقلاع (0–10)", "Importance of quitting (0–10)", "0–10", "integer"],
      ["confidence_to_quit_0_10", "ثقتك بقدرتك (0–10)", "Confidence to quit (0–10)", "0–10", "integer"],
      ["main_reason_for_quitting", "السبب الرئيسي للإقلاع", "Main reason for quitting", "free text", "text"],
      ["main_barriers_multi_select", "أهم العوائق", "Main barriers", "cravings / stress / friends / boredom / family / study / social / withdrawal / access / mood / other", "string[] pipe-joined"],
      ["ever_tried_to_quit", "هل سبق وحاولت الإقلاع؟", "Ever tried to quit?", "yes / no", "yes/no/not_answered"],
      ["number_of_quit_attempts", "عدد المحاولات", "Number of quit attempts", "0–99", "integer"],
      ["longest_quit_duration", "أطول فترة إقلاع", "Longest quit duration", "free text / select", "text"],
      ["quit_methods_used_before", "الطرق المستخدمة سابقاً", "Quit methods used before", "unaided / counseling / app / whatsapp / NRT / medication / reduce / switch / family / other", "string[] pipe-joined"],
      ["main_reason_for_relapse", "السبب الرئيسي للانتكاسة", "Main reason for relapse", "cravings / stress / friends / withdrawal / social / mood / weight / availability / other", "enum"],
    ];
    return vars.map(([name, ar, en, opts, coding]) => ({
      section: "Export: readiness_quit_history",
      variable: name, question: en, options: opts, coding,
      required: false, source: "Stages of Change / NCSCT",
      triagePurpose: "Cohort routing & motivation",
      researchPurpose: "Readiness, motivation and quit-attempt analysis",
      inAnonymizedExport: true,
      table_name: "readiness_stage / motivation_assessment / quit_history",
      export_file: "readiness_quit_history",
      question_text_ar: ar, question_text_en: en, response_options: opts,
      branching_rule: name === "longest_quit_duration" || name === "number_of_quit_attempts"
        ? "asked if ever_tried_to_quit = yes" : "asked at baseline",
      source_framework: "Prochaska Stages of Change / NCSCT",
      included_in_full_export: true, included_in_anonymized_export: true,
      included_in_research_export: true, identifiable_or_sensitive: false,
      missing_value_codes: "not_answered",
    }));
  })(),

  ...((): DataDictionaryEntry[] => {
    const vars: Array<[string, string, string, string, string]> = [
      ["followup_timepoint", "نقطة المتابعة", "Follow-up timepoint", "baseline / 1_week / 4_week / 12_week / 6_month / 12_month", "enum"],
      ["followup_completed_date", "تاريخ المتابعة", "Follow-up completion date", "YYYY-MM-DD", "date"],
      ["contacted_yes_no", "هل تمّ التواصل؟", "Was the participant contacted?", "yes / no", "yes/no/not_answered/not_applicable"],
      ["lost_to_followup_yes_no", "فُقد من المتابعة؟", "Lost to follow-up?", "yes / no", "yes/no/not_answered"],
      ["quit_attempt_made_yes_no", "هل قام بمحاولة إقلاع؟", "Quit attempt made?", "yes / no", "yes/no/not_answered"],
      ["abstinent_yes_no", "ممتنع حالياً؟", "Abstinent at this visit?", "yes / no", "yes/no/not_answered"],
      ["reduced_use_yes_no", "قلّل الاستخدام؟", "Reduced use?", "yes / no", "yes/no/not_answered"],
      ["relapsed_yes_no", "انتكس؟", "Relapsed?", "yes / no", "yes/no/not_answered"],
      ["current_product_use", "المنتج المُستخدم حالياً", "Current product use", "free text", "text"],
      ["current_cigarettes_per_day", "سجائر/يوم حالياً", "Current cigarettes per day", "0–200", "integer"],
      ["current_pouches_per_day", "أكياس/يوم حالياً", "Current pouches per day", "0–100", "integer"],
      ["current_vape_frequency", "تكرار استخدام الفيب", "Current vape frequency", "free text", "text"],
      ["craving_severity_0_10", "شدة الاشتهاء (0–10)", "Craving severity (0–10)", "0–10", "integer"],
      ["confidence_to_quit_0_10", "الثقة بالإقلاع (0–10)", "Confidence to quit (0–10)", "0–10", "integer"],
      ["co_reading_ppm_optional", "قراءة CO (ppm)", "CO reading (ppm)", "numeric", "numeric"],
      ["withdrawal_severity_0_10", "شدة أعراض الانسحاب (0–10)", "Withdrawal severity (0–10)", "0–10", "integer"],
      ["abstinence_duration_days", "مدة الامتناع (أيام)", "Abstinence duration (days)", "0–3650", "integer"],
      ["percent_reduction_estimate", "تقدير نسبة التخفيض (٪)", "Percent reduction estimate (%)", "0–100", "integer"],
      ["satisfaction_with_support_0_10", "الرضا عن الدعم (0–10)", "Satisfaction with support (0–10)", "0–10", "integer"],
    ];
    return vars.map(([name, ar, en, opts, coding]) => ({
      section: "Export: follow_up_outcomes",
      variable: name, question: en, options: opts, coding,
      required: name === "followup_timepoint",
      source: "Russell Standard / NCSCT",
      triagePurpose: "Longitudinal outcome tracking",
      researchPurpose: "Quit rate, reduction trajectory and support satisfaction",
      inAnonymizedExport: true,
      table_name: "follow_up_visits / outcome_tracking",
      export_file: "follow_up_outcomes",
      question_text_ar: ar, question_text_en: en, response_options: opts,
      branching_rule: "one row per participant_code per timepoint",
      source_framework: "Russell Standard / NCSCT",
      included_in_full_export: true, included_in_anonymized_export: true,
      included_in_research_export: true, identifiable_or_sensitive: false,
      missing_value_codes: "not_answered / not_applicable",
    }));
  })(),

  ...((): DataDictionaryEntry[] => {
    const vars: Array<[string, string, string, string, string]> = [
      ["participant_code", "رمز المشارك", "Pseudonymous participant code", "AQ-XXXXXXXX", "text"],
      ["age", "العمر", "Age", "8–110", "integer"],
      ["gender", "الجنس", "Sex / gender", "male / female / prefer_not", "enum"],
      ["city", "المدينة", "City", "free text", "text"],
      ["affiliation_type", "نوع الانتماء", "Affiliation type", "school / university / workplace / community", "enum"],
      ["education_level", "المستوى الدراسي", "Education level", "free text / select", "text"],
      ["preferred_language", "اللغة المفضّلة", "Preferred language", "ar / en", "enum"],
      ["cohort", "المجموعة", "Assigned cohort", "A / B / C / D / E / F / G / H", "enum"],
      ["cohort_reason", "سبب التصنيف", "Cohort reason", "free text", "text"],
      ["doctor_review_needed", "حاجة لمراجعة طبية", "Doctor review needed", "yes / no", "boolean"],
      ["research_consent_status", "حالة الموافقة البحثية", "Research consent status", "given / not_given", "enum"],
      ["submission_date", "تاريخ التعبئة", "Submission date", "YYYY-MM-DD", "date"],
    ];
    return vars.map(([name, ar, en, opts, coding]) => ({
      section: "Export: research_consent_only",
      variable: name, question: en, options: opts, coding,
      required: name === "participant_code" || name === "research_consent_status",
      source: "Internal / Ethics",
      triagePurpose: "—",
      researchPurpose: "Restricted research dataset (consent_research_publication = given)",
      inAnonymizedExport: true,
      table_name: "participants", export_file: "research_consent_only",
      question_text_ar: ar, question_text_en: en, response_options: opts,
      branching_rule: "row included only when research_consent_status = 'given'",
      source_framework: "Aqla ethics consent gate",
      included_in_full_export: true, included_in_anonymized_export: true,
      included_in_research_export: true, identifiable_or_sensitive: false,
      missing_value_codes: "not_answered",
    }));
  })(),

  ...((): DataDictionaryEntry[] => {
    const items: Array<[string, string, string]> = [
      ["family_smoking_exposure", "هل يدخّن أحد في عائلتك؟", "Does anyone in your family smoke or use nicotine?"],
      ["close_friend_smoking_or_nicotine_use", "هل يستخدم صديق مقرّب التبغ/النيكوتين؟", "Does a close friend use tobacco or nicotine?"],
      ["secondhand_smoke_exposure_home", "هل تتعرّض للتدخين السلبي في المنزل؟", "Exposed to secondhand smoke at home?"],
      ["secondhand_smoke_exposure_public_places", "هل تتعرّض للتدخين السلبي في الأماكن العامة؟", "Exposed to secondhand smoke in public places?"],
      ["seen_tobacco_or_nicotine_ads_social_media", "هل رأيت إعلانات على وسائل التواصل؟", "Seen tobacco/nicotine ads on social media?"],
      ["seen_tobacco_or_nicotine_ads_shops", "هل رأيت إعلانات في المحلات؟", "Seen tobacco/nicotine ads in shops?"],
      ["influencer_or_online_promotion_exposure", "هل رأيت ترويجاً من مؤثّرين أو عبر الإنترنت؟", "Seen influencer or online promotion?"],
      ["easy_access_to_products", "هل الوصول للمنتجات سهل؟", "Are these products easy to access?"],
      ["main_source_of_products", "المصدر الرئيسي للمنتجات", "Main source of products"],
      ["online_purchase_or_delivery_exposure", "الشراء أو التوصيل عبر الإنترنت", "Online purchase or delivery exposure"],
      ["purchase_attempt_underage_if_applicable", "محاولة الشراء وأنت قاصر (إن انطبق)", "Underage purchase attempt (if applicable)"],
    ];
    return items.map(([name, ar, en]) => ({
      section: "Export: community_exposure",
      variable: name, question: en,
      options: name === "main_source_of_products"
        ? "free text (shop / friend / family / online / other)"
        : "yes / no / not_sure / prefer_not_to_answer",
      coding: name === "main_source_of_products" ? "text" : "enum",
      required: false, source: "GYTS / GATS / WHO MPOWER",
      triagePurpose: "—",
      researchPurpose: "Community-level exposure & access surveillance",
      inAnonymizedExport: true,
      table_name: "community_exposure", export_file: "community_exposure",
      question_text_ar: ar, question_text_en: en,
      response_options: name === "main_source_of_products"
        ? "free text" : "yes / no / not_sure / prefer_not_to_answer",
      branching_rule: "optional research extension; skippable; underage question only if applicable",
      source_framework: "GYTS / GATS / WHO MPOWER",
      included_in_full_export: true, included_in_anonymized_export: true,
      included_in_research_export: true, identifiable_or_sensitive: false,
      missing_value_codes: "not_answered / skipped_by_branching",
    }));
  })(),
];
