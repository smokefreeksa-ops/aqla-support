export const CHALLENGES=[
 {id:'first_step_24h',title_ar:'تحدي أول خطوة خلال 24 ساعة',title_en:'First Step — 24 Hours',body_ar:'اختر خطوة صغيرة قابلة للتنفيذ خلال اليوم القادم. التقدم أهم من الكمال.',body_en:'Choose one small action you can complete in the next 24 hours. Progress matters more than perfection.',points:10,href:'/aqla/tools'},
 {id:'trigger_battle',title_ar:'تحدي محفز واحد',title_en:'One-Trigger Challenge',body_ar:'اختر محفزًا واحدًا وغيّر الروتين حوله بدل محاولة تغيير كل شيء دفعة واحدة.',body_en:'Choose one trigger and change the routine around it rather than changing everything at once.',points:15,href:'/aqla/tools'},
 {id:'support_someone',title_ar:'تحدي الدعم باحترام',title_en:'Respectful Support Challenge',body_ar:'أرسل رسالة دعم محترمة لشخص يهمك دون ضغط أو لوم.',body_en:'Send one respectful support message without pressure or blame.',points:15,href:'/aqla/help-someone'},
 {id:'awareness_share',title_ar:'تحدي نشر الوعي',title_en:'Awareness Sharing Challenge',body_ar:'أنشئ بطاقة أو ملصقًا توعويًا لا يحتوي بيانات صحية خاصة وشاركه إذا رغبت.',body_en:'Create a privacy-safe awareness card or poster and share it if you choose.',points:15,href:'/aqla/poster-studio'},
 {id:'knowledge',title_ar:'تحدي المعرفة',title_en:'Knowledge Challenge',body_ar:'تعلم واختبر معرفتك حول التدخين والنيكوتين والسلامة.',body_en:'Learn and test your knowledge about smoking, nicotine and safe support.',points:25,href:'/aqla/academy'},
 {id:'day_28',title_ar:'تحدي 28 يومًا من الخطوات',title_en:'28 Days of Small Steps',body_ar:'تابع 28 يومًا من الخطوات السلوكية الصغيرة. لا يتطلب التحدي إعلان حالة الإقلاع أو مشاركة نتيجة صحية.',body_en:'Track 28 days of small behavioural steps. You do not need to publish quit status or any health outcome.',points:50,href:'/aqla/dashboard'},
] as const
export type ChallengeId=typeof CHALLENGES[number]['id']
export type ChallengeState='joined'|'completed'
