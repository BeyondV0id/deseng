import { useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus } from '@/components/icons'
import { Badge } from '@/components/arc/badge/badge'
import { Button } from '@/components/arc/button/button'
import { Dialog, DialogContent } from '@/components/arc/dialog/dialog'
import { Input } from '@/components/arc/input/input'
import { Select } from '@/components/arc/select/select'
import { Textarea } from '@/components/arc/textarea/textarea'
import { collections, type Resource } from '@/catalog'
import { cn } from '@/lib/utils'
import styles from './submit-dialog.module.css'

/** The review note is what the catalogue prints under the name, so it is the
 *  one field with a floor as well as a ceiling. */
const minDescription = 30
const maxDescription = 500

/** The placement a listing is submitted for. Only the free tier is filed here;
 *  a featured listing is arranged on the sponsor page after the review.
 *  The price is paid once for the whole placement, never per week: a listing
 *  sits in the catalogue indefinitely, so a weekly rate would have no end. */
const placements = [
  {
    value: 'free',
    name: 'Free listing',
    price: '$0',
    period: 'always',
    detail: 'An editorial review, and a standard catalogue listing if it is accepted.',
    sponsored: false,
  },
  {
    value: 'featured',
    name: 'Featured placement',
    price: '$19',
    period: 'once',
    detail: 'The same review, then a prominent place in the catalogue. Paid once, and refunded in full if the listing is declined.',
    sponsored: true,
  },
]

/**
 * The site's own name, read from its address, so the one field a visitor
 * should not have to think about can stay blank. `https://www.awwwards.com`
 * gives `Awwwards`; anything unreadable gives an empty string.
 */
function nameFromUrl(raw: string) {
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`)
    const host = url.hostname.replace(/^www\./, '')
    const label = host.split('.')[0] ?? ''
    if (!label) return ''
    return label.charAt(0).toUpperCase() + label.slice(1)
  } catch {
    return ''
  }
}

/**
 * Suggesting a listing.
 *
 * One column, read top to bottom: the address, the sentence that says why it
 * belongs, where it is filed, the name if the visitor wants to set it, and the
 * placement. Every field is an Arc control, so the form inherits their focus,
 * press and message behaviour rather than restating it.
 */
export function SubmitDialog({ open, onClose, onSubmit, onFeatured }: {
  open: boolean
  onClose: () => void
  onSubmit: (item: Pick<Resource, 'name' | 'url' | 'description' | 'category'>) => Promise<string | null>
  onFeatured: () => void
}) {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [collection, setCollection] = useState(collections[0]!.id)
  const [tag, setTag] = useState(collections[0]!.categories[0]!)
  const [placement, setPlacement] = useState('free')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const tags = useMemo(
    () => collections.find(item => item.id === collection)?.categories ?? [],
    [collection],
  )

  function chooseCollection(next: string) {
    setCollection(next)
    const first = collections.find(item => item.id === next)?.categories[0]
    if (first) setTag(first)
  }

  function reset() {
    setUrl('')
    setName('')
    setDescription('')
    setCollection(collections[0]!.id)
    setTag(collections[0]!.categories[0]!)
    setPlacement('free')
    setError('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    let address: URL
    try {
      address = new URL(url.includes('://') ? url.trim() : `https://${url.trim()}`)
    } catch {
      setError('Enter a valid web address.')
      return
    }

    const note = description.trim()
    if (note.length < minDescription) {
      setError(`Describe the listing in at least ${minDescription} characters.`)
      return
    }

    const title = name.trim() || nameFromUrl(url)
    if (!title) {
      setError('Name the listing, or check the address.')
      return
    }

    setPending(true)
    const failure = await onSubmit({
      name: title,
      url: address.toString().replace(/\/$/, ''),
      description: note,
      category: tag,
    })
    setPending(false)

    if (failure) {
      setError(failure)
      return
    }

    const featured = placement === 'featured'
    reset()
    onClose()
    if (featured) onFeatured()
  }

  /** Arrow keys walk the two placements, the way they walk a list of rows. */
  function stepPlacement(event: KeyboardEvent<HTMLDivElement>) {
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown'
    const back = event.key === 'ArrowLeft' || event.key === 'ArrowUp'
    if (!forward && !back) return
    event.preventDefault()
    const index = placements.findIndex(item => item.value === placement)
    const next = placements[(index + (forward ? 1 : -1) + placements.length) % placements.length]
    if (!next) return
    setPlacement(next.value)
    event.currentTarget.querySelector<HTMLElement>(`[data-plan="${next.value}"]`)?.focus()
  }

  return <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
    <DialogContent
      title="Suggest a listing"
      description="Add the website first. We'll retrieve what we can, then you can review every detail."
    >
      <form onSubmit={submit} className={styles.form} noValidate>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Listing details</h3>
          <Input
            label="Website"
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="example.com"
            value={url}
            onChange={event => setUrl(event.target.value)}
            autoFocus
            required
          />
          <Textarea
            label="What is useful, thoughtful or especially well made?"
            name="description"
            placeholder="One or two sentences on what makes it worth keeping."
            description={`${description.length}/${maxDescription} characters`}
            rows={4}
            maxLength={maxDescription}
            value={description}
            onChange={event => setDescription(event.target.value)}
            required
          />
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Where it belongs</h3>
          <Select
            label="Collection"
            value={collection}
            onValueChange={chooseCollection}
            options={collections.map(item => ({ value: item.id, label: item.label }))}
          />
          <Select
            label="Tag"
            value={tag}
            onValueChange={setTag}
            options={tags.map(item => ({ value: item, label: item }))}
          />
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Optional details</h3>
          <Input
            label="Name"
            name="name"
            placeholder={nameFromUrl(url) || 'e.g. Awwwards'}
            description="Leave it blank and the address supplies the name."
            value={name}
            onChange={event => setName(event.target.value)}
            maxLength={120}
          />
        </section>

        <section className={styles.section}>
          <div className={styles.placementHead}>
            <h3 className={styles.sectionTitle}>Choose placement</h3>
            <p className={styles.note}>A featured placement never guarantees acceptance. If the listing is declined, it is refunded in full.</p>
          </div>
          {/* Two cards, not two radio rows: a placement is a price, and the
              price is the thing being read. The paid card wears the same
              `Sponsored` mark every paid placement in the app wears, so the
              money is never a surprise. The pair is one radio group under the
              skin, so arrow keys walk it the way they walk a list of rows. */}
          <div
            className={styles.plans}
            role="radiogroup"
            aria-label="Choose placement"
            onKeyDown={stepPlacement}
          >
            {placements.map(plan => {
              const chosen = placement === plan.value
              return <button
                key={plan.value}
                type="button"
                role="radio"
                aria-checked={chosen}
                tabIndex={chosen ? 0 : -1}
                data-plan={plan.value}
                className={cn(styles.plan, plan.sponsored && styles.planFeatured, chosen && styles.isChosen)}
                onClick={() => setPlacement(plan.value)}
              >
                <span className={styles.planHead}>
                  {plan.sponsored
                    ? <Badge className={styles.planBadge} size="sm">Sponsored</Badge>
                    : <span className={styles.planTag}>Editorial</span>}
                  <span className={styles.planPick} aria-hidden="true">{chosen && <Check size={13} weight="Filled" />}</span>
                </span>
                <span className={styles.planBody}>
                  <span className={styles.planMark} aria-hidden="true">{plan.sponsored ? <Plus size={15} /> : <span className={styles.planMarkLetter}>d</span>}</span>
                  <span className={styles.planCopy}>
                    <span className={styles.planName}>{plan.name}</span>
                    <span className={styles.planPrice}>{plan.price}<span className={styles.planPeriod}>{plan.period}</span></span>
                  </span>
                </span>
                <span className={styles.planDetail}>{plan.detail}</span>
              </button>
            })}
          </div>
        </section>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <p className={styles.terms}>
          By submitting, you agree to our <Link to="/terms" onClick={onClose}>terms</Link> and <Link to="/privacy" onClick={onClose}>privacy policy</Link>.
        </p>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={pending}>Submit for review</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
}

