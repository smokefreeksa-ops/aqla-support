'use client'

import { FormEvent, useState } from 'react'
import type { UnsubscribeScope } from '@/lib/communication-preferences.types'

export default function EmailUnsubscribeForm({
  token,
  initialScope,
}: {
  token: string
  initialScope: UnsubscribeScope
}) {
  const [scope, setScope] = useState<UnsubscribeScope>(initialScope)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/email/unsubscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, scope }),
      })
      const data = await response.json() as { error?: string }
      if (!response.ok) throw new Error(data.error || 'unsubscribe_failed')
      setDone(true)
    } catch {
      setError('We could not update this preference right now. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <section className="ax-card">
        <h2>تم تحديث تفضيلات البريد الإلكتروني</h2>
        <p>Your email preferences have been updated. This does not delete your Aqla account or saved plan.</p>
      </section>
    )
  }

  return (
    <form className="ax-card" onSubmit={submit}>
      <h2>إدارة رسائل أقلع | Manage Aqla email</h2>
      <p>يمكنك إيقاف رسائل المتابعة أو الرسائل البحثية غير الأساسية. رسائل الأمان أو الإجراءات التي تطلبها بنفسك تُدار بشكل منفصل.</p>
      <p>You can opt out of non-essential follow-up or research email. Safety-related or explicitly requested account actions are handled separately.</p>

      <label style={{ display: 'grid', gap: 8, marginTop: 16 }}>
        <span>What would you like to stop?</span>
        <select value={scope} onChange={(event) => setScope(event.target.value as UnsubscribeScope)}>
          <option value="followup">Aqla follow-up email</option>
          <option value="research">Research / study email</option>
          <option value="all_non_transactional">All non-essential email</option>
        </select>
      </label>

      <div className="ax-hero-actions" style={{ marginTop: 18 }}>
        <button className="ax-button primary" type="submit" disabled={saving}>{saving ? 'Updating…' : 'Confirm preference'}</button>
        <a className="ax-button secondary" href="/aqla">Back to Aqla</a>
      </div>
      {error ? <p role="alert">{error}</p> : null}
    </form>
  )
}
