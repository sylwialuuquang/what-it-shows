<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupProblems } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  let { ticket }: { ticket: number } = $props();

  const groups = $derived(groupProblems(reports as Report[], notes.oneDayMove, tenantOf, ticket));
  const total = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
</script>

<p class="sum">
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'} ·
  <strong>{total}</strong> reports in #{ticket}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.id)}
      <tr>
        <td>
          <code>{g.id}</code>
          {g.name}
        </td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.id)}
  {#if g.id === 'one-day'}
    <p class="note">
      {g.reports.map((r) => r.id).join(', ')}
    </p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
