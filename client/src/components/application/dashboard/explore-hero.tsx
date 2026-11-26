import { AgentGlobe } from './agent-globe'

export function ExploreHero({ loading = false }: { loading?: boolean }) {
  return <header className="explore-hero">
    <h1 className="explore-hero-title">Give your AI agents a taste</h1>
    <p className="explore-hero-subtitle">Browse curated sites, components, and tools for your next build.</p>
    <AgentGlobe loading={loading} />
  </header>
}
