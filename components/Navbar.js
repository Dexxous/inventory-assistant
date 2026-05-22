import Image from 'next/image'
import SignOutButton from './SignOutButton'

export default function Navbar({ session, backHref, backLabel }) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-0 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/atos-logo.svg" alt="Atos" width={72} height={24} />
            <div className="border-l border-gray-300 h-6"></div>
            <span className="text-sm font-semibold text-gray-700">InventarizaceTool</span>
          </div>
          {backHref && (
            <a href={backHref} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← {backLabel ?? 'Zpět'}
            </a>
          )}
        </div>
        {session && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{session.user.name}</span>
            <span className="text-[11px] font-semibold tracking-widest uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded">
              {session.user.role}
            </span>
            <SignOutButton />
          </div>
        )}
      </div>
    </nav>
  )
}