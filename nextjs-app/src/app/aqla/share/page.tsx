'use client'

import { useRef, useState } from 'react'

const CARDS=[
 {key:'start',arTitle:'بدأت مع أقلع',enTitle:'I started with Aqla',ar:'بدأت أفهم علاقتي بالنيكوتين وأخذت أول خطوة. البداية لا تحتاج كمالًا؛ تحتاج خطوة واحدة.',en:'I started understanding my nicotine pattern and took a first step. Progress does not require perfection; it starts with one step.'},
 {key:'craving',arTitle:'تجاوزت رغبة',enTitle:'I got through a craving',ar:'الرغبة موجة وتعدّي. اليوم تجاوزت واحدة بدون ما أحكم على نفسي.',en:'A craving is a wave and it passes. Today I got through one without judging myself.'},
 {key:'week',arTitle:'أسبوع بخطوات صغيرة',enTitle:'A week of small steps',ar:'هذا الأسبوع ركزت على التقدم بدل المثالية. كل موقف أفهمه أفضل يجعل الخطوة القادمة أسهل.',en:'This week I focused on progress rather than perfection. Every trigger I understand makes the next step easier.'},
 {key:'support',arTitle:'الدعم يصنع فرقًا',enTitle:'Support matters',ar:'الإقلاع لا يحتاج أن يكون رحلة فردية. شخص داعم وكلمة محترمة قد يصنعان فرقًا.',en:'Quitting does not have to be a solo journey. One supportive person and respectful words can matter.'},
] as const

export default function SharePage(){
 const [lang,setLang]=useState<'ar'|'en'>('ar');const ar=lang==='ar';const [selected,setSelected]=useState(0);const [copied,setCopied]=useState(false);const ref=useRef<HTMLDivElement|null>(null);const card=CARDS[selected]
 const url=typeof window==='undefined'?'https://staging.smokefreeksa.com/aqla':`${window.location.origin}/aqla`
 const title=ar?card.arTitle:card.enTitle;const body=ar?card.ar:card.en
 async function copy(){await navigator.clipboard.writeText(`${body}\n\n${url}`);setCopied(true);setTimeout(()=>setCopied(false),1400)}
 async function share(){if(navigator.share){try{await navigator.share({title,text:body,url});return}catch{}}await copy()}
 function wa(){window.open(`https://wa.me/?text=${encodeURIComponent(`${body}\n\n${url}`)}`,'_blank','noopener,noreferrer')}
 function x(){window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${body}\n${url}`)}`,'_blank','noopener,noreferrer')}
 async function download(){if(!ref.current)return;try{const html2canvas=(await import('html2canvas')).default;const canvas=await html2canvas(ref.current,{backgroundColor:'#f2f8f4',scale:2,useCORS:true});const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download=`aqla-${card.key}-card.png`;a.click()}catch{}}
 return <main className="eng-page" dir={ar?'rtl':'ltr'} lang={lang}><div className="eng-shell">
  <header className="eng-top"><a className="eng-brand" href="/aqla"><img src="/aqla-logo.png" alt="Aqla"/><span>أقلع | Aqla</span></a><nav className="eng-nav"><a href="/aqla/help-someone">{ar?'ساعد شخصًا':'Help someone'}</a><a href="/aqla/tools">{ar?'الأدوات':'Tools'}</a><button className="eng-btn" onClick={()=>setLang(ar?'en':'ar')}>{ar?'EN':'ع'}</button></nav></header>
  <section className="eng-hero"><article className="eng-card"><span className="eng-kicker">{ar?'مشاركة آمنة':'Privacy-safe sharing'}</span><h1>{ar?'شارك التقدم، لا بياناتك الصحية':'Share progress, not health data'}</h1><p className="eng-muted">{ar?'بطاقات المشاركة لا تتضمن اسمك، نتيجتك، المنتجات التي تستخدمها، درجات الاعتماد، الخطة أو أي تفاصيل صحية.':'Share cards contain no name, product use, dependence score, plan details, or other health information.'}</p><div className="eng-note">{ar?'لا نشارك رابط خطتك الخاصة. الرابط العام يعيد الشخص إلى صفحة أقلع فقط.':'Your private plan URL is never shared. The public link only opens Aqla.'}</div></article><div ref={ref} className="eng-share-card"><img src="/aqla-logo.png" alt="" style={{width:58,height:58,objectFit:'contain'}}/><div><strong>{title}</strong><p>{body}</p></div><small>Aqla — أقلع · aqla</small></div></section>
  <section className="eng-card"><h2>{ar?'اختر البطاقة':'Choose a card'}</h2><div className="eng-options">{CARDS.map((c,i)=><button key={c.key} className={`eng-chip ${selected===i?'active':''}`} onClick={()=>setSelected(i)}>{ar?c.arTitle:c.enTitle}</button>)}</div><div className="eng-actions"><button className="eng-btn primary" onClick={()=>void share()}>{ar?'مشاركة':'Share'}</button><button className="eng-btn" onClick={wa}>WhatsApp</button><button className="eng-btn" onClick={x}>X</button><button className="eng-btn" onClick={()=>void copy()}>{copied?(ar?'تم النسخ':'Copied'):(ar?'نسخ':'Copy')}</button><button className="eng-btn" onClick={()=>void download()}>{ar?'تحميل PNG':'Download PNG'}</button></div></section>
  <footer className="eng-footer">{ar?'المشاركة اختيارية دائمًا.':'Sharing is always optional.'} · Aqla — أقلع</footer>
 </div></main>
}