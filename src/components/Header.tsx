import { Link } from '@tanstack/react-router'
import { Github } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-cyan-500/20">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="text-white">
          <div className="text-xl font-bold font-mono text-cyan-400">
            <span className="text-cyan-500">{'>'}</span> GitYear Studio
          </div>
        </Link>

        <a
          href="https://github.com/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-cyan-500/30 text-sm font-medium text-cyan-300 hover:border-cyan-400 hover:text-cyan-200 transition-all duration-200"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
      </div>
    </header>
  )
}
