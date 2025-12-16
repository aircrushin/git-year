import { createFileRoute } from '@tanstack/react-router'
import {
  Calendar,
  ChartNoAxesColumnIncreasing,
  Download,
  GitCommit,
  GitPullRequest,
  Github,
  Link2,
  Loader2,
  MessageSquare,
  Sparkles,
  Star,
} from 'lucide-react'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

type GithubStats = {
  profile: {
    name: string
    login: string
    avatarUrl: string
    bio?: string
    location?: string
    htmlUrl: string
    followers: number
    following: number
  }
  counts: {
    commits: number
    prs: number
    issues: number
    stars: number
    repos: number
    contributionsTotal: number
  }
  languages: { name: string; value: number }[]
  topRepos: { name: string; url: string; stars: number; description?: string; language?: string }[]
}

type FormState = {
  username: string
  year: number
  token: string
}

const currentYear = new Date().getFullYear()

export const Route = createFileRoute('/')({ component: App })

function App() {
  const t = useTranslations('home')
  const [form, setForm] = useState<FormState>({
    username: 'vercel',
    year: currentYear,
    token: '',
  })
  const [stats, setStats] = useState<GithubStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const breakdown = useMemo(() => {
    if (!stats) return []
    const items = [
      { label: 'Commits', value: stats.counts.commits, color: 'from-cyan-400 to-blue-500' },
      { label: 'PRs', value: stats.counts.prs, color: 'from-emerald-400 to-cyan-400' },
      { label: 'Issues', value: stats.counts.issues, color: 'from-amber-400 to-orange-500' },
      { label: 'Starred', value: stats.counts.stars, color: 'from-fuchsia-400 to-violet-500' },
    ]
    const total = Math.max(items.reduce((sum, item) => sum + item.value, 0), 1)
    return items.map((item) => ({ ...item, percent: Math.round((item.value / total) * 100) }))
  }, [stats])

  const sparkline = useMemo(() => {
    if (!stats) return []
    const seed = [
      stats.counts.commits,
      stats.counts.prs * 2,
      stats.counts.issues * 1.5,
      stats.counts.stars * 3,
      stats.counts.repos,
    ]
    const base = Math.max(...seed, 1)
    return Array.from({ length: 12 }).map((_, index) => {
      const wave = Math.sin(index / 2) * 0.3 + 0.7
      const value = (seed[index % seed.length] / base) * wave
      return Math.max(0.1, Math.min(1, value))
    })
  }, [stats])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await fetchGithubYearStats(form)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.fetchFailed'))
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: false,
      })
      const link = document.createElement('a')
      link.download = `${form.username}-${form.year}-git-year.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error(err)
      setError(t('errors.downloadFailed'))
    }
  }

  const shareText = stats
    ? t('shareText', {
        year: form.year,
        commits: stats.counts.commits,
        prs: stats.counts.prs,
        issues: stats.counts.issues,
        stars: stats.counts.stars,
      })
    : ''

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.2),transparent_28%),radial-gradient(circle_at_70%_70%,rgba(109,40,217,0.15),transparent_30%)]" />
        <div className="max-w-6xl mx-auto px-6 pb-10 pt-14 relative">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-white/5 px-4 py-2 text-sm font-medium text-cyan-200 shadow-[0_10px_60px_-35px_rgba(34,211,238,0.7)]">
                <Sparkles className="h-4 w-4" />
                {t('hero.badge')}
              </div>
              <h1 className="mt-4 text-4xl md:text-5xl font-semibold leading-tight text-white [letter-spacing:-0.02em]">
                {t('hero.title')}
              </h1>
              <p className="mt-4 text-lg text-slate-300 max-w-2xl">
                {t('hero.description')}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
                <Badge>{t('hero.pillRealtime')}</Badge>
                <Badge>{t('hero.pillMotion')}</Badge>
                <Badge>{t('hero.pillColors')}</Badge>
              </div>
            </div>
            <div className="w-full md:w-auto md:min-w-[320px]">
              <FormCard
                form={form}
                loading={loading}
                onSubmit={handleSubmit}
                onChange={setForm}
              />
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-red-100">
              {error}
            </div>
          )}

          {stats && (
            <>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={<GitCommit className="h-5 w-5" />}
                  label={t('statsCards.commits')}
                  value={stats.counts.commits}
                  accent="from-cyan-400 to-blue-500"
                />
                <StatCard
                  icon={<GitPullRequest className="h-5 w-5" />}
                  label={t('statsCards.prs')}
                  value={stats.counts.prs}
                  accent="from-emerald-400 to-teal-500"
                />
                <StatCard
                  icon={<MessageSquare className="h-5 w-5" />}
                  label={t('statsCards.issues')}
                  value={stats.counts.issues}
                  accent="from-amber-400 to-orange-500"
                />
                <StatCard
                  icon={<Star className="h-5 w-5" />}
                  label={t('statsCards.stars')}
                  value={stats.counts.stars}
                  accent="from-fuchsia-400 to-violet-500"
                />
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-cyan-500/5 lg:col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-white">{t('overview.title')}</h2>
                    <div className="text-xs text-slate-400">
                      {t('overview.dateRange', { year: form.year })}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
                    <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 p-4 shadow-inner shadow-cyan-500/10">
                      <div className="flex justify-between text-sm text-cyan-400 font-mono">
                        <span className="flex items-center gap-2">
                          <span className="text-cyan-500">{'>'}</span> {t('overview.breakdown')}
                        </span>
                        <span className="text-cyan-300">
                          {t('overview.total', { total: stats.counts.contributionsTotal })}
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {breakdown.map((item, idx) => (
                          <div key={item.label} className="group">
                            <div className="flex items-center justify-between text-sm text-slate-200">
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-cyan-500 text-xs">{'0x' + idx.toString(16)}</span>
                                <span className={`text-xs bg-gradient-to-r ${item.color} bg-clip-text text-transparent font-bold`}>
                                  {item.label}
                                </span>
                              </div>
                              <span className="font-mono text-xs text-cyan-400 tabular-nums">
                                {item.value.toString().padStart(4, '0')} <span className="text-cyan-600">|</span> {item.percent}%
                              </span>
                            </div>
                            <div className="mt-2 h-2 rounded-sm bg-slate-950/80 border border-slate-800 overflow-hidden relative">
                              <div
                                className={`h-full bg-gradient-to-r ${item.color} relative overflow-hidden transition-all duration-500`}
                                style={{ width: `${Math.max(item.percent, 4)}%` }}
                              >
                                <div className="absolute inset-0 animate-pulse bg-white/10" style={{ animationDelay: `${idx * 200}ms` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 p-4 shadow-inner shadow-cyan-500/10">
                      <div className="flex items-center justify-between text-sm text-cyan-400 font-mono">
                        <span className="flex items-center gap-2">
                          <span className="text-cyan-500">{'>'}</span> {t('overview.timeline')}
                        </span>
                        <span className="text-cyan-600 text-xs">{t('overview.frequency')}</span>
                      </div>
                      <div className="mt-4 flex h-28 items-end gap-1.5 bg-slate-950/50 border border-slate-800 rounded-lg p-2">
                        {sparkline.map((value, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-sm bg-gradient-to-t from-cyan-600 via-cyan-400 to-cyan-300 relative overflow-hidden group"
                            style={{ height: `${value * 100}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 border-t border-cyan-400/30" />
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-300">
                        <div className="rounded-lg border border-cyan-500/30 bg-slate-950/60 px-3 py-2 hover:border-cyan-400 transition-colors">
                          <div className="text-[10px] uppercase tracking-wide text-cyan-500 font-mono">
                            {t('overview.activityIndex')}
                          </div>
                          <div className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
                            {(sparkline.reduce((a, b) => a + b, 0) / sparkline.length).toFixed(2)}
                          </div>
                        </div>
                        <div className="rounded-lg border border-cyan-500/30 bg-slate-950/60 px-3 py-2 hover:border-cyan-400 transition-colors">
                          <div className="text-[10px] uppercase tracking-wide text-cyan-500 font-mono">
                            {t('overview.peak')}
                          </div>
                          <div className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
                            {Math.max(...sparkline).toFixed(2)}
                          </div>
                        </div>
                        <div className="rounded-lg border border-cyan-500/30 bg-slate-950/60 px-3 py-2 hover:border-cyan-400 transition-colors">
                          <div className="text-[10px] uppercase tracking-wide text-cyan-500 font-mono">
                            {t('overview.prCompletion')}
                          </div>
                          <div className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
                            {Math.min(99, Math.max(12, stats.counts.prs)).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950 p-6 shadow-xl shadow-cyan-500/15">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                      <span className="text-cyan-500">{'>'}</span> {t('languages.title')}
                    </h2>
                    <ChartNoAxesColumnIncreasing className="h-5 w-5 text-cyan-400" />
                  </div>
                  <p className="mt-1 text-sm text-cyan-500/70 font-mono">
                    {t('languages.hint')}
                  </p>
                  <div className="mt-4 space-y-3">
                    {stats.languages.length === 0 && (
                      <div className="rounded-lg border border-cyan-500/30 bg-slate-950/60 px-3 py-2 text-sm text-cyan-400 font-mono">
                        {t('languages.empty')}
                      </div>
                    )}
                    {stats.languages.map((lang, idx) => (
                      <div key={lang.name} className="group flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm text-slate-200">
                            <span className="font-mono flex items-center gap-2">
                              <span className="text-cyan-500 text-xs">#{idx + 1}</span>
                              <span className="text-cyan-300">{lang.name}</span>
                            </span>
                            <span className="font-mono text-xs text-cyan-400 tabular-nums">[{lang.value}] repos</span>
                          </div>
                          <div className="mt-2 h-2 rounded-sm bg-slate-950 border border-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 relative"
                              style={{ width: `${Math.min(lang.value * 8, 100)}%` }}
                            >
                              <div className="absolute inset-0 bg-white/10 animate-pulse" style={{ animationDelay: `${idx * 150}ms` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl border border-cyan-500/30 bg-slate-950/50 p-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2 text-cyan-300 font-mono">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {t.rich('languages.reposThisYear', {
                          count: stats.counts.repos,
                          value: (chunks) => <span className="text-cyan-400 font-bold">{chunks}</span>,
                        })}
                      </span>
                    </div>
                    <p className="mt-2 text-cyan-500/60 font-mono text-xs">
                      {t('languages.reposNote', { year: form.year })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-950 p-6 shadow-2xl shadow-cyan-500/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{t('shareCard.title')}</h2>
                      <p className="text-sm text-slate-400">{t('shareCard.description')}</p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:-translate-y-0.5 transition duration-150"
                    >
                      <Download className="h-4 w-4" />
                      {t('shareCard.export')}
                    </button>
                  </div>

                  <div
                    ref={cardRef}
                    className="mt-4 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950 p-6 shadow-inner shadow-cyan-500/10"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={stats.profile.avatarUrl}
                          alt={stats.profile.login}
                          className="h-14 w-14 rounded-2xl border border-slate-800 object-cover"
                        />
                        <div>
                          <div className="text-sm uppercase tracking-[0.26em] text-slate-400">
                            {form.year} GitHub YEAR
                          </div>
                          <div className="text-xl font-semibold text-white">
                            {stats.profile.name || stats.profile.login}
                          </div>
                          <a
                            href={stats.profile.htmlUrl}
                            className="flex items-center gap-1 text-sm text-cyan-300"
                            target="_blank"
                            rel="noreferrer"
                          >
                            @{stats.profile.login}
                            <Link2 className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                      <div className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300">
                        <span className="text-cyan-300 font-semibold">
                          {t('shareCard.contributions', { count: stats.counts.contributionsTotal })}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-slate-200">
                      {stats.profile.bio || t('shareCard.bioFallback')}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <ShareStat
                        label={t('shareCard.shareStats.commits')}
                        value={stats.counts.commits}
                        color="from-cyan-400 to-blue-500"
                      />
                      <ShareStat
                        label={t('shareCard.shareStats.prs')}
                        value={stats.counts.prs}
                        color="from-emerald-400 to-teal-500"
                      />
                      <ShareStat
                        label={t('shareCard.shareStats.issues')}
                        value={stats.counts.issues}
                        color="from-amber-400 to-orange-500"
                      />
                      <ShareStat
                        label={t('shareCard.shareStats.stars')}
                        value={stats.counts.stars}
                        color="from-fuchsia-400 to-violet-500"
                      />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
                      {stats.topRepos.slice(0, 3).map((repo) => (
                        <div
                          key={repo.url}
                          className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <a
                              href={repo.url}
                              className="font-semibold text-white hover:text-cyan-300"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {repo.name}
                            </a>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1 text-[11px] text-cyan-200">
                          <Star className="h-3 w-3" />
                          {repo.stars}
                        </span>
                      </div>
                      <div
                        className="text-xs text-slate-400"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {repo.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl shadow-cyan-500/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">{t('fastShare.title')}</h2>
                    <Github className="h-5 w-5 text-cyan-300" />
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {t('fastShare.description')}
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {t('fastShare.label')}
                    </div>
                    <p className="mt-2 text-sm text-slate-200 leading-relaxed">
                      {shareText || t('fastShare.placeholder')}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        disabled={!stats}
                        onClick={async () => {
                          if (!shareText || !navigator?.clipboard) return
                          try {
                            await navigator.clipboard.writeText(shareText)
                          } catch (err) {
                            console.error('Copy failed', err)
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:-translate-y-0.5 transition duration-150"
                      >
                        {t('fastShare.copyCta')}
                      </button>
                      <a
                        href={stats?.profile.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:-translate-y-0.5 transition duration-150"
                      >
                        {t('fastShare.viewGithub')}
                      </a>
                    </div>
                  </div>

                  <div id="how-it-works" className="mt-5 space-y-3 text-sm text-slate-300">
                    <Step
                      title={t('steps.oneTitle')}
                      description={t('steps.oneDesc')}
                    />
                    <Step
                      title={t('steps.twoTitle')}
                      description={t('steps.twoDesc')}
                    />
                    <Step
                      title={t('steps.threeTitle')}
                      description={t('steps.threeDesc')}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function FormCard({
  form,
  loading,
  onSubmit,
  onChange,
}: {
  form: FormState
  loading: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onChange: (next: FormState) => void
}) {
  const t = useTranslations('home')
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 grid place-items-center shadow-lg shadow-cyan-500/25">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.32em] text-slate-400">GitYear</div>
          <div className="text-lg font-semibold text-white">{t('form.title')}</div>
        </div>
      </div>

      <label className="mt-6 block text-sm font-medium text-slate-200">
        {t('form.usernameLabel')}
      </label>
      <input
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400"
        placeholder={t('form.usernamePlaceholder')}
        value={form.username}
        onChange={(event) =>
          onChange({
            ...form,
            username: event.target.value.trim(),
          })
        }
        required
      />

      <label className="mt-4 block text-sm font-medium text-slate-200">{t('form.yearLabel')}</label>
      <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
        <Calendar className="h-4 w-4 text-slate-400" />
        <input
          type="number"
          min="2008"
          max={currentYear}
          className="flex-1 bg-transparent text-white outline-none"
          value={form.year}
          onChange={(event) =>
            onChange({
              ...form,
              year: Number(event.target.value) || currentYear,
            })
          }
        />
      </div>

      <label className="mt-4 block text-sm font-medium text-slate-200">
        {t('form.tokenLabel')}
      </label>
      <textarea
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
        placeholder={t('form.tokenPlaceholder')}
        value={form.token}
        onChange={(event) =>
          onChange({
            ...form,
            token: event.target.value.trim(),
          })
        }
        rows={3}
      />

      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition duration-150 hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? t('form.loading') : t('form.submit')}
        </button>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...form,
              username: 'octocat',
            })
          }
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:border-cyan-400/60 transition"
        >
          {t('form.sample')}
        </button>
      </div>
    </form>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode
  label: string
  value: number
  accent: string
}) {
  const binary = value.toString(2).padStart(12, '0')
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-4 shadow-xl shadow-cyan-500/10 hover:border-cyan-400 hover:shadow-cyan-500/20 transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <div className="absolute top-2 right-2 text-[7px] font-mono text-cyan-500/20 leading-tight">
        {binary.match(/.{1,4}/g)?.join('\n')}
      </div>
      <div className="relative flex items-center justify-between">
        <div className="rounded-xl bg-slate-950/60 border border-cyan-500/30 p-3 text-cyan-400 group-hover:text-cyan-300 transition-colors">{icon}</div>
        <div className="text-4xl font-bold font-mono text-white tabular-nums">{value}</div>
      </div>
      <div className="relative mt-3 flex items-center justify-between">
        <div className="text-sm text-cyan-400 font-mono">{label}</div>
        <div className="text-xs text-cyan-600 font-mono">0x{value.toString(16).toUpperCase()}</div>
      </div>
    </div>
  )
}

function ShareStat({ label, value, color }: { label: string; value: number; color: string }) {
  const binary = value.toString(2).padStart(16, '0')
  return (
    <div className="group relative rounded-xl border border-cyan-500/30 bg-slate-900/90 px-4 py-3 overflow-hidden transition-all duration-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <div className="absolute top-0 right-0 text-[8px] font-mono text-cyan-500/20 leading-tight p-2">
        {binary.match(/.{1,4}/g)?.join(' ')}
      </div>
      <div className="relative text-xs uppercase tracking-[0.2em] text-cyan-400 font-mono">{label}</div>
      <div className="relative mt-2 flex items-baseline gap-2">
        <div className="text-3xl font-bold text-white font-mono tracking-tight">{value}</div>
        <div className="text-xs text-cyan-500/60 font-mono">0x{value.toString(16).toUpperCase()}</div>
      </div>
    </div>
  )
}

function Step({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
      <div className="text-sm font-semibold text-white">{title}</div>
      <p className="mt-1 text-slate-400">{description}</p>
    </div>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
      {children}
    </span>
  )
}

async function fetchGithubYearStats({ username, year, token }: FormState): Promise<GithubStats> {
  const dateRange = `${year}-01-01..${year}-12-31`
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  const commitHeaders = { ...headers, Accept: 'application/vnd.github.cloak-preview+json' }
  const starHeaders = { ...headers, Accept: 'application/vnd.github.star+json' }

  const user = await fetchJson(`https://api.github.com/users/${username}`, headers)
  const repos = await fetchJson(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    headers,
  )

  const [commits, prs, issues, stars] = await Promise.all([
    safeSearch(
      `https://api.github.com/search/commits?q=author:${username}+committer-date:${dateRange}`,
      commitHeaders,
    ),
    safeSearch(
      `https://api.github.com/search/issues?q=author:${username}+type:pr+created:${dateRange}`,
      headers,
    ),
    safeSearch(
      `https://api.github.com/search/issues?q=author:${username}+type:issue+created:${dateRange}`,
      headers,
    ),
    fetchStarredThisYear(username, year, starHeaders),
  ])

  const languageMap = new Map<string, number>()
  const activeRepos = (Array.isArray(repos) ? repos : []).filter((repo) =>
    (repo.pushed_at || '').startsWith(`${year}`),
  )

  activeRepos.forEach((repo) => {
    if (repo.language) {
      languageMap.set(repo.language, (languageMap.get(repo.language) || 0) + 1)
    }
  })

  const languages = Array.from(languageMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const topRepos = (Array.isArray(repos) ? repos : [])
    .slice()
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 5)
    .map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      stars: repo.stargazers_count,
      description: repo.description,
      language: repo.language,
    }))

  return {
    profile: {
      name: user.name,
      login: user.login,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      location: user.location,
      htmlUrl: user.html_url,
      followers: user.followers,
      following: user.following,
    },
    counts: {
      commits,
      prs,
      issues,
      stars,
      repos: activeRepos.length,
      contributionsTotal: commits + prs + issues + stars,
    },
    languages,
    topRepos,
  }
}

async function fetchJson(url: string, headers: Record<string, string>) {
  const response = await fetch(url, { headers })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed: ${response.status}`)
  }
  return response.json()
}

async function safeSearch(url: string, headers: Record<string, string>) {
  try {
    const result = await fetchJson(url, headers)
    return typeof result.total_count === 'number' ? result.total_count : 0
  } catch (error) {
    console.error('[GitYear] search failed', error)
    return 0
  }
}

async function fetchStarredThisYear(username: string, year: number, headers: Record<string, string>) {
  let page = 1
  let total = 0
  while (page <= 5) {
    const response = await fetch(
      `https://api.github.com/users/${username}/starred?per_page=100&page=${page}`,
      { headers },
    )
    if (!response.ok) break
    const data = await response.json()
    if (!Array.isArray(data) || data.length === 0) break
    const matches = data.filter(
      (item) => typeof item.starred_at === 'string' && item.starred_at.startsWith(`${year}`),
    )
    total += matches.length
    if (matches.length < data.length) break
    page += 1
  }
  return total
}
