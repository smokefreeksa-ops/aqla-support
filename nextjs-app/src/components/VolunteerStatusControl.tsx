'use client'

import { useState } from 'react'

const STATUSES=['submitted','screening','training','approved','active','paused','declined'] as const
export default function VolunteerStatusControl({code,initial}:{code:string;initial:string}){
 const [status,setStatus]=useState(initial);const [busy,setBusy]=useState(false);const [error,setError]=useState(false)
 async function save(next:string){setBusy(true);setError(false);try{const res=await fetch(`/api/admin/volunteers/${encodeURIComponent(code)}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:next})});if(!res.ok)throw new Error('failed');setStatus(next)}catch{setError(true)}finally{setBusy(false)}}
 return <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}><select value={status} disabled={busy} onChange={e=>void save(e.target.value)}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select>{busy?<small>Saving…</small>:null}{error?<small style={{color:'#8c2d2d'}}>Update failed</small>:null}</div>
}
