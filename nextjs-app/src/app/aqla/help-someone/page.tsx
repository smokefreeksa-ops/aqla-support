'use client'

import { useMemo, useRef, useState } from 'react'

const RELATIONS = [
  ['friend','صديق','Friend'],['sibling','أخ / أخت','Brother / Sister'],['parent','أب / أم','Parent'],['spouse','زوج / زوجة','Spouse'],
  ['colleague','زميل','Colleague'],['student','طالب','Student'],['relative','قريب','Relative'],['someone','شخص يهمني','Someone I care about'],
] as const
const STYLES = [
  ['gentle','لطيفة','Gentle'],['emotional','مؤثرة','Emotional'],['short','مختصرة','Short'],['formal','رسمية','Formal'],['warm','قريبة وعفوية','Warm'],['encouraging','مشجعة بدون ضغط','Encouraging'],
] as const

type StyleKey = typeof STYLES[number][0]
type RelationKey = typeof RELATIONS[number][0]

const AR: Record<StyleKey,(name:string)=>string> = {
  gentle:n=>`أرسلت لك هذه الرسالة لأنني أهتم لأمرك${n ? ` يا ${n}` : ''}. ليس المطلوب أن تغيّر كل شيء اليوم؛ يكفي أن تبدأ بخطوة صغيرة تناسبك.`,
  emotional:n=>`${n || 'صحتك'} ومستقبلك يستحقان لحظة انتباه. هذه ليست نصيحة أو ضغطًا، فقط باب بسيط إذا أحببت أن تبدأ.`,
  short:n=>`${n ? `${n}، ` : ''}قد تكون هذه مجرد رسالة، لكنها قد تفتح بداية مختلفة. جرّب أقلع عندما تكون مستعدًا واختر خطوتك بنفسك.`,
  formal:n=>`${n ? `${n}، ` : ''}أرسل لك هذه الدعوة تقديرًا لصحتك ومستقبلك. أقلع يوفر مسارًا مجانيًا لفهم علاقتك بالتدخين أو النيكوتين واختيار خطوة مناسبة.`,
  warm:n=>`${n ? `${n}، ` : ''}من يهتم لأمرك لا يضغط عليك، بل يذكّرك أنك لست وحدك. إذا أحببت أن تبدأ بخطوة بسيطة، أقلع هنا.`,
  encouraging:n=>`${n ? `${n}، ` : ''}ما أبغى أضغط عليك، بس لأنك تهمني حبيت أرسل لك أقلع. يمكن خطوة بسيطة اليوم تفتح باب أفضل بكرة.`,
}
const EN: Record<StyleKey,(name:string)=>string> = {
  gentle:n=>`${n ? `${n}, ` : ''}I sent this because I care about you. You do not have to change everything today; one small step can be enough to begin.`,
  emotional:n=>`${n || 'Your health'} and future are worth a moment of attention. This is not pressure or judgment, just a simple door if you ever want to start.`,
  short:n=>`${n ? `${n}, ` : ''}this may be just a message, but it could open a different beginning. Try Aqla when you are ready and choose your own step.`,
  formal:n=>`${n ? `${n}, ` : ''}I am sharing this with respect for your health and future. Aqla offers a free pathway to understand smoking or nicotine use and choose a suitable next step.`,
  warm:n=>`${n ? `${n}, ` : ''}someone who cares does not pressure you. They simply remind you that you are not alone. Aqla is here if you want one small step.`,
  encouraging:n=>`${n ? `${n}, ` : ''}no pressure at all — I just wanted to share Aqla because you matter to me. One small step today can open a better door tomorrow.`,
}

const UNSAFE = [
  /أنت\s*ضعيف/i,/أنت\s*فاشل/i,/لازم\s*توقف/i,/غصب/i,/علاج\s*مضمون/i,/معتمد\s*من\s*وزارة/i,/وزارة\s*الصحة/i,/أشخص/i,/أعالج/i,
  /you\s+are\s+weak/i,/you\s+failed/i,/you\s+must\s+quit/i,/guaranteed\s+cure/i,/ministry\s+of\s+health/i,/medically\s+certified/i,/official\s+partner/i,
]

export default function HelpSomeonePage(){
  const [lang,setLang]=useState<'ar'|'en'>('ar')
  const [recipient,setRecipient]=useState('')
  const [inviter,setInviter]=useState('')
  const [relation,setRelation]=useState<RelationKey>('someone')
  const [style,setStyle]=useState<StyleKey>('gentle')
  const [custom,setCustom]=useState('')
  const [copied,setCopied]=useState(false)
  const [unsafe,setUnsafe]=useState(false)
  const previewRef=useRef<HTMLDivElement|null>(null)
  const ar=lang==='ar'
  const relationLabel=RELATIONS.find(r=>r[0]===relation)?.[ar?1:2] ?? ''
  const base=useMemo(()=>ar?AR[style](recipient.trim()):EN[style](recipient.trim()),[ar,recipient,style])
  const message=custom.trim()||base
  const publicUrl=typeof window==='undefined'?'https://staging.smokefreeksa.com/aqla':`${window.location.origin}/aqla`

  function validate(text:string){const bad=UNSAFE.some(p=>p.test(text));setUnsafe(bad);return !bad}
  async function copy(){if(!validate(message))return;await navigator.clipboard.writeText(`${message}\n\n${ar?'ابدأ مع أقلع':'Start with Aqla'}: ${publicUrl}`);setCopied(true);setTimeout(()=>setCopied(false),1600)}
  async function share(){if(!validate(message))return;const text=`${message}\n\n${ar?'ابدأ مع أقلع':'Start with Aqla'}`;if(navigator.share){try{await navigator.share({title:ar?'رسالة دعم من أقلع':'Aqla support message',text,url:publicUrl});return}catch{}}await copy()}
  function whatsapp(){if(!validate(message))return;window.open(`https://wa.me/?text=${encodeURIComponent(`${message}\n\n${ar?'ابدأ مع أقلع':'Start with Aqla'}: ${publicUrl}`)}`,'_blank','noopener,noreferrer')}
  async function download(){if(!previewRef.current||!validate(message))return;try{const html2canvas=(await import('html2canvas')).default;const canvas=await html2canvas(previewRef.current,{backgroundColor:'#0f5a3a',scale:2,useCORS:true});const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='aqla-support-card.png';a.click()}catch{}}

  return <main className="eng-page" dir={ar?'rtl':'ltr'} lang={lang}>
    <div className="eng-shell">
      <header className="eng-top"><a className="eng-brand" href="/aqla"><img src="/aqla-logo.png" alt="Aqla"/><span>أقلع | Aqla</span></a><nav className="eng-nav"><a href="/aqla/tools">{ar?'الأدوات':'Tools'}</a><a href="/aqla/share">{ar?'المشاركة':'Share'}</a><button className="eng-btn" onClick={()=>setLang(ar?'en':'ar')}>{ar?'EN':'ع'}</button></nav></header>
      <section className="eng-hero">
        <article className="eng-card"><span className="eng-kicker">{ar?'ساعد شخصًا يهمك':'Help someone you care about'}</span><h1>{ar?'رسالة دعم بدون ضغط أو حكم':'A supportive message without pressure or judgment'}</h1><p className="eng-muted">{ar?'اختر العلاقة والأسلوب، ثم عدّل الرسالة إن أردت. الأسماء والرسالة تبقى في جهازك ولا تُحفظ في خادم أقلع عند استخدام هذه الأداة.':'Choose the relationship and tone, then edit if you want. Names and message text stay on your device and are not stored by Aqla when using this tool.'}</p><div className="eng-note">{ar?'هذه الأداة للدعم الإنساني فقط، وليست لتشخيص الشخص أو الضغط عليه للإقلاع.':'This tool is for supportive outreach only. It is not for diagnosing or pressuring someone to quit.'}</div></article>
        <div className="eng-preview" ref={previewRef}><img src="/aqla-logo.png" alt=""/><blockquote>{message}</blockquote><small>{inviter.trim()?`${ar?'من':'From'}: ${inviter.trim()}`:`${relationLabel} · Aqla`}</small></div>
      </section>
      <section className="eng-card">
        <div className="eng-grid">
          <div><div className="eng-field"><label>{ar?'اسم الشخص — اختياري':'Recipient name — optional'}</label><input value={recipient} maxLength={60} onChange={e=>setRecipient(e.target.value)} placeholder={ar?'مثال: أحمد':'e.g. Ahmed'}/></div><div className="eng-field"><label>{ar?'اسم المرسل — اختياري':'Your name — optional'}</label><input value={inviter} maxLength={60} onChange={e=>setInviter(e.target.value)}/></div></div>
          <div><div className="eng-field"><label>{ar?'العلاقة':'Relationship'}</label><select value={relation} onChange={e=>setRelation(e.target.value as RelationKey)}>{RELATIONS.map(r=><option key={r[0]} value={r[0]}>{r[ar?1:2]}</option>)}</select></div><div className="eng-field"><label>{ar?'أسلوب الرسالة':'Message style'}</label><select value={style} onChange={e=>setStyle(e.target.value as StyleKey)}>{STYLES.map(s=><option key={s[0]} value={s[0]}>{s[ar?1:2]}</option>)}</select></div></div>
        </div>
        <div className="eng-field"><label>{ar?'تخصيص الرسالة — اختياري':'Custom message — optional'}</label><textarea maxLength={ar?280:360} value={custom} onChange={e=>{setCustom(e.target.value);validate(e.target.value)}} placeholder={base}/></div>
        {unsafe?<div className="eng-note eng-alert eng-danger">{ar?'عدّل الرسالة لتكون داعمة ومحترمة ومن دون ضغط، إهانة، تشخيص أو ادعاء رسمي/طبي.':'Please remove pressure, shaming, diagnosis, or unsupported official/medical claims.'}</div>:null}
        <div className="eng-actions"><button className="eng-btn primary" onClick={()=>void share()}>{ar?'مشاركة':'Share'}</button><button className="eng-btn" onClick={whatsapp}>WhatsApp</button><button className="eng-btn" onClick={()=>void copy()}>{copied?(ar?'تم النسخ ✓':'Copied ✓'):(ar?'نسخ الرسالة':'Copy message')}</button><button className="eng-btn" onClick={()=>void download()}>{ar?'تحميل البطاقة PNG':'Download card PNG'}</button></div>
      </section>
      <footer className="eng-footer">Aqla — أقلع · {ar?'الدعم باحترام واستقلالية الشخص':'Support with respect for autonomy'}</footer>
    </div>
  </main>
}
