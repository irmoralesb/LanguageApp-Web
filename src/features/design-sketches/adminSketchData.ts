export type AdminPageId = 'sites' | 'roles' | 'permissions' | 'users' | 'user-services'

export const ADMIN_PAGES: Array<{
  id: AdminPageId
  label: string
  route: string
  group: 'Sites' | 'Users'
  description: string
}> = [
  {
    id: 'sites',
    label: 'Sites catalog',
    route: '/admin/sites',
    group: 'Sites',
    description: 'Manage registered sites and open role configuration.',
  },
  {
    id: 'roles',
    label: 'Site roles',
    route: '/admin/sites/:serviceId/roles',
    group: 'Sites',
    description: 'Manage roles for a selected site.',
  },
  {
    id: 'permissions',
    label: 'Role permissions',
    route: '/admin/sites/:serviceId/roles/:roleId/permissions',
    group: 'Sites',
    description: 'Create permissions and assign/unassign them for a role.',
  },
  {
    id: 'users',
    label: 'User management',
    route: '/admin/users',
    group: 'Users',
    description: 'Create users and manage account status.',
  },
  {
    id: 'user-services',
    label: 'User services & roles',
    route: '/admin/users/:userId/services',
    group: 'Users',
    description: 'Assign services to users and choose service roles.',
  },
]
