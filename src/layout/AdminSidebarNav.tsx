import { Link } from 'react-router-dom'
import {
  ADMIN_PAGES,
  ADMIN_ROOT_PAGES,
  getAdminPageHref,
  getVisibleAdminChildPage,
  parseAdminNavContext,
  type AdminPageId,
} from '@/shared/adminNavigation'

function navLinkClass(isActive: boolean, indented: boolean): string {
  const base = `block w-full rounded-lg py-2 text-left text-sm ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
  }`
  return indented ? `${base} ml-3 border-l border-slate-600 pl-3 pr-3` : `${base} px-3`
}

type AdminSidebarNavProps = {
  pathname: string
  activeAdminPage: AdminPageId | null
  onNavigate: () => void
}

export function AdminSidebarNav({
  pathname,
  activeAdminPage,
  onNavigate,
}: AdminSidebarNavProps) {
  const context = parseAdminNavContext(pathname)
  const visibleChild = getVisibleAdminChildPage(activeAdminPage)
  const childPage = visibleChild
    ? ADMIN_PAGES.find((page) => page.id === visibleChild)
    : null

  return (
    <ul className="space-y-1">
      {ADMIN_ROOT_PAGES.map((page) => (
        <li key={page.id}>
          <Link
            to={getAdminPageHref(page.id, context)}
            onClick={onNavigate}
            className={navLinkClass(activeAdminPage === page.id, false)}
          >
            <span className="block">{page.label}</span>
            <span className="block text-xs opacity-70">{page.group}</span>
          </Link>
          {childPage?.parentId === page.id && (
            <Link
              to={getAdminPageHref(childPage.id, context)}
              onClick={onNavigate}
              className={`mt-1 ${navLinkClass(activeAdminPage === childPage.id, true)}`}
            >
              <span className="block">{childPage.label}</span>
              <span className="block text-xs opacity-70">{childPage.group}</span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}
