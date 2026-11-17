import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/arc/button/button'
import { Input } from '@/components/arc/input/input'
import { Select } from '@/components/arc/select/select'
import { Textarea } from '@/components/arc/textarea/textarea'
import { collections, type Resource } from '@/catalog'
import { sponsorView, pathForView } from '@/lib/view-path'
import styles from './submit-section.module.css'

const minDescription = 30
const maxDescription = 500

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

export function SubmitSection({ onSubmit }: {
  onSubmit: (item: Pick<Resource, 'name' | 'url' | 'description' | 'category'>) => Promise<string | null>
}) {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [collection, setCollection] = useState(collections[0]!.id)
  const [tag, setTag] = useState(collections[0]!.categories[0]!)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess(false)

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

    setUrl('')
    setName('')
    setDescription('')
    setCollection(collections[0]!.id)
    setTag(collections[0]!.categories[0]!)
    setSuccess(true)
  }

  return <>
    <section className={styles.submit} aria-labelledby="submit-title">
      <header className="resource-section-header">
        <div className="resource-section-title">
          <h1 id="submit-title">Submit</h1>
          <p className="page-description">
            Know a useful resource that belongs in the library? Send it for editorial review.
          </p>
        </div>
      </header>

      <form onSubmit={submit} className={styles.form} noValidate>
        <section className={styles.section} aria-labelledby="submit-details-title">
          <h2 id="submit-details-title" className={styles.sectionTitle}>Listing details</h2>
          <Input
            label="Website"
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="example.com"
            value={url}
            onChange={event => setUrl(event.target.value)}
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

        <section className={styles.section} aria-labelledby="submit-category-title">
          <h2 id="submit-category-title" className={styles.sectionTitle}>Where it belongs</h2>
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

        <section className={styles.section} aria-labelledby="submit-optional-title">
          <h2 id="submit-optional-title" className={styles.sectionTitle}>Optional details</h2>
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

        <aside className={styles.notice} aria-label="Submission review information">
          <p><strong>Submitting is free.</strong> We read every submission against our guidelines, so listing is not guaranteed and there is no fixed turnaround. Looking for a sponsored placement instead?</p>
          <Link to={pathForView(sponsorView)}>See sponsorship <span aria-hidden="true">→</span></Link>
        </aside>

        {success && <p className={styles.success} role="status">Thanks. Your resource is in for review.</p>}
        {error && <p className={styles.error} role="alert">{error}</p>}

        <p className={styles.terms}>
          By submitting, you agree to our <Link to="/terms">terms</Link> and <Link to="/privacy">privacy policy</Link>.
        </p>

        <div className={styles.actions}>
          <Button type="submit" variant="primary" size="md" loading={pending}>Submit for review</Button>
        </div>
      </form>
    </section>
  </>
}
