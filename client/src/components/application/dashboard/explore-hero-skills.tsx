import { AvatarGroup } from '@/components/arc/avatar-group/avatar-group'
import { CopyButton } from '@/components/arc/copy-button/copy-button'

/**
 * Placeholder for the agent skills that will be built on this library. The
 * names and the command stand in for real entries; the UI is already wired,
 * so publishing a skill only means replacing this data.
 */
const skillAuthors = [
  { name: 'Design systems' },
  { name: 'Component picker' },
  { name: 'Icon finder' },
  { name: 'Palette maker' },
]

const installCommand = 'npx skills add reference/skills'

/** A quiet line under the hero that tells visitors skills are on the way. */
export function ExploreHeroSkills() {
  return <div className="explore-hero-skills">
    <AvatarGroup members={skillAuthors} max={3} size="sm" label="Skill contributors" />
    <p className="explore-hero-skills-text">
      Skills built on Reference <span className="explore-hero-skills-soon">are on the way</span>
    </p>
    <span className="explore-hero-skills-command">
      <code>{installCommand}</code>
      <CopyButton value={installCommand} label="Copy install command" variant="plain" iconOnly />
    </span>
  </div>
}
