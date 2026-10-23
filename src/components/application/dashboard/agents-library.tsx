import { Avatar } from '@/components/arc/avatar/avatar'
import { Card } from '@/components/card'
import { agents } from '@/catalog-agents'

export function AgentsLibrary() {
  return <section className="agents-library">
    <header className="agents-library-intro">
      <h1>Agents</h1>
      <p>Browse AI agents that support UI Skills.</p>
    </header>
    <div className="agents-grid">
      {agents.map(agent => <Card
        key={agent.name}
        className="agent-card"
        href={agent.url}
        target="_blank"
        rel="noreferrer"
      >
        <span className="agent-card-head">
          <Avatar name={agent.name} src={`https://${agent.domain}/favicon.ico`} size="md" />
          <span className="agent-card-name">{agent.name}</span>
        </span>
        <span className="agent-card-description">{agent.description}</span>
      </Card>)}
    </div>
  </section>
}
