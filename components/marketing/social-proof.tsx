import Image from 'next/image'

const STATS = [
  { value: '9', label: 'platforms supported' },
  { value: '12x', label: 'faster than posting by hand' },
  { value: '2.4M+', label: 'posts scheduled' },
  { value: '$0', label: 'to get started' },
]

const QUOTES = [
  {
    quote:
      'I used to spend Sunday nights rewriting the same post 6 times. Now I write once and Crosspost AI handles the rest. It genuinely sounds native on every app.',
    name: 'Maya Chen',
    role: 'Creator · 180K followers',
    avatar: '/avatars/maya.png',
  },
  {
    quote:
      'The per-platform AI is the difference-maker. My LinkedIn reach tripled because the posts finally read like LinkedIn, not a copy-paste from Twitter.',
    name: 'Deon Carter',
    role: 'Founder · B2B SaaS',
    avatar: '/avatars/deon.png',
  },
]

export function SocialProof() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-4 sm:p-8">
        {STATS.map((s) => (
          <div key={s.label} className="text-center sm:text-left">
            <div className="text-3xl font-semibold tracking-tight text-foreground">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {QUOTES.map((q) => (
          <figure key={q.name} className="flex flex-col rounded-2xl border border-border bg-card p-6">
            <blockquote className="text-pretty text-base leading-relaxed text-foreground">
              &ldquo;{q.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <Image
                src={q.avatar}
                alt={q.name}
                width={44}
                height={44}
                className="size-11 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-semibold text-foreground">{q.name}</div>
                <div className="text-sm text-muted-foreground">{q.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
