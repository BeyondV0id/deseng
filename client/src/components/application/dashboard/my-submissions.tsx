import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Button } from '@/components/arc/button/button'
import { Badge, type BadgeTone } from '@/components/arc/badge/badge'
import { Dialog, DialogContent } from '@/components/arc/dialog/dialog'
import { EmptyState } from '@/components/arc/empty-state/empty-state'
import { CheckCircle, FileText, Plus, Timer, Warning } from '@/components/icons'
import { api } from '@/lib/api'
import type { LibrarySubmission, SubmissionState } from '@/lib/library-types'
import styles from './my-submissions.module.css'

/** The moment a listing arrived, in the person's own locale, without a clock. */
const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * Where a review stands, as the author reads it. The label says what happened
 * to the listing, never what the reader should do about it, and the icon carries
 * the same distinction so the state is not only a colour.
 */
const reviewStates: Record<SubmissionState, { label: string; tone: BadgeTone; icon: ReactNode }> = {
  pending: { label: 'In review', tone: 'neutral', icon: <Timer size={13} /> },
  approved: { label: 'Listed', tone: 'neutral', icon: <CheckCircle size={13} /> },
  declined: { label: 'Declined', tone: 'danger', icon: <Warning size={13} /> },
}

/** Rows drawn while the list is in flight: the same shapes the real rows take. */
const LOADING_ROWS = 3

type Status = 'loading' | 'ready' | 'error'

function SubmissionSkeleton() {
  return <ul className={styles.list} aria-hidden="true">
    {Array.from({ length: LOADING_ROWS }, (_, row) => <li key={row} className={styles.item}>
      <span className={styles.skeletonRow}>
        <span className={styles.skeletonMark} />
        <span className={styles.copy}>
          <span className={`${styles.skeletonBar} ${styles.skeletonName}`} />
          <span className={`${styles.skeletonBar} ${styles.skeletonDescription}`} />
          <span className={`${styles.skeletonBar} ${styles.skeletonMeta}`} />
        </span>
      </span>
    </li>)}
  </ul>
}

function SubmissionRow({ submission, failedMark, onMarkFailed }: {
  submission: LibrarySubmission
  failedMark: boolean
  onMarkFailed: () => void
}) {
  const state = reviewStates[submission.state]
  const initial = submission.name.trim().charAt(0).toUpperCase()

  return <li className={styles.item}>
    <a className={styles.row} href={submission.url} target="_blank" rel="noreferrer noopener">
      {/* The site's own mark, then the listing's first letter. A mark that
          fails to load is not retried: the letter stands in from then on. */}
      <span className={styles.mark} aria-hidden="true">
        {submission.faviconUrl && !failedMark
          ? <img src={submission.faviconUrl} alt="" width={20} height={20} loading="lazy" decoding="async" onError={onMarkFailed} />
          : <span className={styles.initial}>{initial}</span>}
      </span>
      <span className={styles.copy}>
        <span className={styles.headingLine}>
          <span className={styles.name}>{submission.name}</span>
          <Badge className={styles.state} tone={state.tone} size="sm" icon={state.icon}>{state.label}</Badge>
        </span>
        <span className={styles.description}>{submission.description}</span>
        <span className={styles.meta}>
          <span>{submission.category}</span>
          <span className={styles.metaDot} aria-hidden="true" />
          <time dateTime={submission.submittedAt}>{dateFormat.format(new Date(submission.submittedAt))}</time>
        </span>
      </span>
    </a>
  </li>
}

/**
 * My submissions: the listings this account has sent, newest first, with where
 * each one's review stands.
 *
 * It is reached from the account menu, so it is a window over the page rather
 * than a route: the catalogue behind it stays put, and the empty state's one
 * action hands back to the page through `onAddResource`, which is the same
 * submit opener the top bar's plus already uses.
 */
export function MySubmissions({ open, onClose, onAddResource }: {
  open: boolean
  onClose: () => void
  onAddResource: () => void
}) {
  const [status, setStatus] = useState<Status>('loading')
  const [submissions, setSubmissions] = useState<LibrarySubmission[]>([])
  const [attempt, setAttempt] = useState(0)
  const [failedMarks, setFailedMarks] = useState<ReadonlySet<string>>(new Set())

  const refresh = useCallback(() => setAttempt(current => current + 1), [])

  useEffect(() => {
    let live = true
    // The window opens with a read, so a fresh visit never lands on someone
    // else's list or last session's. A reload keeps the rows on screen while the
    // new copy is in flight, so the refresh never blinks back to the skeleton.
    setStatus(current => current === 'ready' ? current : 'loading')
    api.submissions()
      .then(result => {
        if (!live) return
        setSubmissions(result.submissions)
        setStatus('ready')
      })
      .catch(() => {
        if (!live) return
        setStatus(current => current === 'ready' ? current : 'error')
      })
    return () => { live = false }
  }, [attempt])

  const count = submissions.length

  return <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
    <DialogContent className={styles.dialog} title="My submissions" description="The listings you have sent, newest first, with where each one's review stands.">
      <div className={styles.body}>
        {status === 'loading' && <SubmissionSkeleton />}

        {status === 'error' && <EmptyState
          title="Your submissions did not load"
          description="The list is kept on the server. Check the connection, then try once more."
          icon={<Warning size={22} />}
          action={<Button variant="primary" size="sm" onClick={refresh}>Try again</Button>}
        />}

        {status === 'ready' && count === 0 && <EmptyState
          title="You have not sent a listing yet"
          description="Suggest a site, a tool or a component you think belongs in the library. It appears here the moment you send it."
          icon={<FileText size={22} />}
          action={<Button variant="primary" size="sm" onClick={() => { onClose(); onAddResource() }}><Plus size={15} /> Submit a listing</Button>}
        />}

        {status === 'ready' && count > 0 && <>
          <ul className={styles.list}>
            {submissions.map(submission => <SubmissionRow
              key={submission.id}
              submission={submission}
              failedMark={failedMarks.has(submission.id)}
              onMarkFailed={() => setFailedMarks(current => new Set(current).add(submission.id))}
            />)}
          </ul>
          <p className={styles.note}>
            A listing joins the catalogue as soon as it is sent. The badge is the review's verdict, not the listing's place in it.
          </p>
        </>}
      </div>
    </DialogContent>
  </Dialog>
}
