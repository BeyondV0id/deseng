import { LibraryFooter } from './library-footer'
import { SponsorSection } from './sponsor-section'

export const sponsorDescription = 'Sponsor the library. Two labelled placements, one month each, kept apart from the catalogue order.'

export function SponsorContent() {
  return <>
    <SponsorSection />
    <LibraryFooter />
  </>
}
