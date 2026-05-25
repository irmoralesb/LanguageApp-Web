export type AdminPageId = 'sites' | 'roles' | 'permissions' | 'users' | 'user-services'

export type AdminNavLevel = 'root' | 'child'

export const ADMIN_PAGES: Array<{
  id: AdminPageId
  label: string
  route: string
  group: 'Sites' | 'Users'
  description: string
  level: AdminNavLevel
  parentId?: AdminPageId
}> = [
  {
    id: 'sites',
    label: 'Sites catalog',
    route: '/admin/sites',
    group: 'Sites',
    description: 'Manage registered sites and open role configuration.',
    level: 'root',
  },
  {
    id: 'roles',
    label: 'Site roles',
    route: '/admin/sites/:serviceId/roles',
    group: 'Sites',
    description: 'Manage roles for a selected site.',
    level: 'child',
    parentId: 'sites',
  },
  {
    id: 'permissions',
    label: 'Role permissions',
    route: '/admin/sites/:serviceId/roles/:roleId/permissions',
    group: 'Sites',
    description: 'Create permissions and assign/unassign them for a role.',
    level: 'child',
    parentId: 'sites',
  },
  {
    id: 'users',
    label: 'User management',
    route: '/admin/users',
    group: 'Users',
    description: 'Create users and manage account status.',
    level: 'root',
  },
  {
    id: 'user-services',
    label: 'User services & roles',
    route: '/admin/users/:userId/services',
    group: 'Users',
    description: 'Assign services to users and choose service roles.',
    level: 'child',
    parentId: 'users',
  },
]

export const ADMIN_ROOT_PAGES = ADMIN_PAGES.filter((page) => page.level === 'root')

export type AdminNavContext = {
  serviceId: string | null
  roleId: string | null
  userId: string | null
}

export function parseAdminNavContext(pathname: string): AdminNavContext {
  const permissionsMatch = pathname.match(
    /^\/admin\/sites\/([^/]+)\/roles\/([^/]+)\/permissions/,
  )
  if (permissionsMatch) {
    return {
      serviceId: permissionsMatch[1],
      roleId: permissionsMatch[2],
      userId: null,
    }
  }

  const rolesMatch = pathname.match(/^\/admin\/sites\/([^/]+)\/roles\/?$/)
  if (rolesMatch) {
    return { serviceId: rolesMatch[1], roleId: null, userId: null }
  }

  const userServicesMatch = pathname.match(/^\/admin\/users\/([^/]+)\/services/)
  if (userServicesMatch) {
    return { serviceId: null, roleId: null, userId: userServicesMatch[1] }
  }

  return { serviceId: null, roleId: null, userId: null }
}

export function getAdminPageHref(
  pageId: AdminPageId,
  context: AdminNavContext,
): string {
  switch (pageId) {
    case 'sites':
      return '/admin/sites'
    case 'roles':
      return context.serviceId
        ? `/admin/sites/${context.serviceId}/roles`
        : '/admin/sites'
    case 'permissions':
      return context.serviceId && context.roleId
        ? `/admin/sites/${context.serviceId}/roles/${context.roleId}/permissions`
        : '/admin/sites'
    case 'users':
      return '/admin/users'
    case 'user-services':
      return context.userId
        ? `/admin/users/${context.userId}/services`
        : '/admin/users'
    default:
      return '/admin/sites'
  }
}

export function getVisibleAdminChildPage(
  activePage: AdminPageId | null,
): AdminPageId | null {
  if (activePage === 'roles' || activePage === 'permissions' || activePage === 'user-services') {
    return activePage
  }
  return null
}

export function resolveAdminPageId(pathname: string): AdminPageId | null {
  if (pathname.includes('/permissions')) return 'permissions'
  if (/^\/admin\/users\/[^/]+\/services/.test(pathname)) return 'user-services'
  if (/^\/admin\/sites\/[^/]+\/roles\/?$/.test(pathname)) return 'roles'
  if (pathname === '/admin/sites') return 'sites'
  if (pathname === '/admin/users') return 'users'
  return null
}
