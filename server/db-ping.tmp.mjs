import postgres from 'postgres'

const sql = postgres(process.env.DIRECT_URL, { prepare: false, connect_timeout: 8 })
try {
  const states = await sql`select review_status, count(*)::int as n from resource group by review_status order by review_status`
  console.log('review_status:', states.map(r => `${r.review_status}=${r.n}`).join(', '))
  const submitted = await sql`select count(*)::int as n from resource where submitted_by_id is not null`
  console.log('submitted rows:', submitted[0].n)
} catch (error) {
  console.log('DB error:', error.message)
} finally {
  await sql.end()
}
