import { ADMIN_PAGES, type AdminPageId } from '../adminSketchData'

type Accent = 'teal' | 'indigo' | 'blue'

type AdminSectionProposalProps = {
  accent: Accent
  activePage: AdminPageId
}

const ACCENTS = {
  teal: {
    text: 'text-teal-700',
    button: 'bg-teal-600 hover:bg-teal-700',
    soft: 'border-teal-100 bg-teal-50 text-teal-900',
    selected: 'border-teal-400 bg-teal-50',
  },
  indigo: {
    text: 'text-indigo-700',
    button: 'bg-indigo-600 hover:bg-indigo-700',
    soft: 'border-indigo-100 bg-indigo-50 text-indigo-900',
    selected: 'border-indigo-400 bg-indigo-50',
  },
  blue: {
    text: 'text-blue-700',
    button: 'bg-blue-600 hover:bg-blue-700',
    soft: 'border-blue-100 bg-blue-50 text-blue-900',
    selected: 'border-blue-400 bg-blue-50',
  },
} as const

const SITE_ROWS = [
  { name: 'Phrasal Verbs', status: 'Active', url: 'localhost', port: '5101' },
  { name: 'Prepositions', status: 'Active', url: 'localhost', port: '5102' },
  { name: 'Chat Practice', status: 'Active', url: 'localhost', port: '5103' },
  { name: 'German Verbs', status: 'Draft', url: 'localhost', port: '5104' },
]

const ROLE_ROWS = [
  { name: 'phrasal-verbs-user', description: 'Can practice phrasal verbs' },
  { name: 'prepositions-user', description: 'Can practice prepositions' },
  { name: 'admin', description: 'Can manage sites, roles, permissions, and users' },
]

const PERMISSION_ROWS = [
  { assigned: true, name: 'sites.read', resource: 'sites', action: 'read' },
  { assigned: true, name: 'roles.manage', resource: 'roles', action: 'manage' },
  { assigned: false, name: 'users.delete', resource: 'users', action: 'delete' },
]

const USER_ROWS = [
  { name: 'Ana Rivera', email: 'ana@example.com', active: 'Yes', verified: 'Yes' },
  { name: 'James Cole', email: 'james@example.com', active: 'Yes', verified: 'Yes' },
  { name: 'Mia Chen', email: 'mia@example.com', active: 'No', verified: 'No' },
]

const USER_SERVICE_ROWS = [
  { service: 'Phrasal Verbs', roles: 'phrasal-verbs-user' },
  { service: 'Prepositions', roles: 'prepositions-user' },
  { service: 'Chat Practice', roles: 'chat-practice-user' },
]

export function AdminSectionProposal({
  accent,
  activePage,
}: AdminSectionProposalProps) {
  const styles = ACCENTS[accent]
  const page = ADMIN_PAGES.find((item) => item.id === activePage) ?? ADMIN_PAGES[0]

  return (
    <section>
      <div className="mb-5">
        <p className={`text-sm font-semibold ${styles.text}`}>Admin sketch</p>
        <h2 className="text-2xl font-bold text-slate-900">Administration</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Same structure as the real Admin section: Sites flow for services, roles, and
          permissions; Users flow for accounts, service assignment, and roles.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminMetric label="Sites" value="4" styles={styles} />
          <AdminMetric label="Users" value="128" styles={styles} />
        </div>
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className={`border-b px-5 py-4 ${styles.soft}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                  {page.group} flow
                </p>
                <h3 className="text-xl font-bold">{page.label}</h3>
                <p className="mt-1 text-sm opacity-90">{page.description}</p>
              </div>
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${styles.button}`}
              >
                {getPrimaryAction(activePage)}
              </button>
            </div>
          </div>
          <div className="p-5">
            {activePage === 'sites' && <SitesTable />}
            {activePage === 'roles' && <RolesTable />}
            {activePage === 'permissions' && <PermissionsTable />}
            {activePage === 'users' && <UsersTable />}
            {activePage === 'user-services' && <UserServicesPanel styles={styles} />}
          </div>
        </div>
      </div>
    </section>
  )
}

function getPrimaryAction(page: AdminPageId) {
  switch (page) {
    case 'sites':
      return 'Add site'
    case 'roles':
      return 'Add role'
    case 'permissions':
      return 'Create permission'
    case 'users':
      return 'Create user'
    case 'user-services':
      return 'Assign service'
  }
}

function AdminMetric({
  label,
  value,
  styles,
}: {
  label: string
  value: string
  styles: (typeof ACCENTS)[Accent]
}) {
  return (
    <div className={`rounded-xl border p-3 ${styles.soft}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function SitesTable() {
  return (
    <SketchTable
      headers={['Name', 'Status', 'URL', 'Port', 'Actions']}
      rows={SITE_ROWS.map((site) => [
        site.name,
        site.status,
        site.url,
        site.port,
        'Roles · Edit · Remove',
      ])}
    />
  )
}

function RolesTable() {
  return (
    <SketchTable
      headers={['Name', 'Description', 'Actions']}
      rows={ROLE_ROWS.map((role) => [
        role.name,
        role.description,
        'Edit permissions · Edit · Remove',
      ])}
    />
  )
}

function PermissionsTable() {
  return (
    <SketchTable
      headers={['Assigned', 'Name', 'Resource', 'Action', 'Actions']}
      rows={PERMISSION_ROWS.map((permission) => [
        permission.assigned ? 'Yes' : 'No',
        permission.name,
        permission.resource,
        permission.action,
        'Edit · Remove',
      ])}
    />
  )
}

function UsersTable() {
  return (
    <SketchTable
      headers={['Name', 'Email', 'Active', 'Verified', 'Actions']}
      rows={USER_ROWS.map((user) => [
        user.name,
        user.email,
        user.active,
        user.verified,
        'Services · Activate · Unlock · Edit · Delete',
      ])}
    />
  )
}

function UserServicesPanel({ styles }: { styles: (typeof ACCENTS)[Accent] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div>
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Ana Rivera</p>
          <p className="text-sm text-slate-500">ana@example.com</p>
        </div>
        <SketchTable
          headers={['Assigned service', 'Roles', 'Actions']}
          rows={USER_SERVICE_ROWS.map((row) => [
            row.service,
            row.roles,
            'Edit roles · Unassign',
          ])}
        />
      </div>
      <aside className={`rounded-xl border p-4 text-sm ${styles.soft}`}>
        <p className="font-semibold">Role editor modal</p>
        <p className="mt-2 opacity-80">
          Mirrors the current per-user service page: assign a service, then select roles for that
          service.
        </p>
        <div className="mt-3 space-y-2">
          {['user', 'admin', 'viewer'].map((role) => (
            <label key={role} className="block rounded-lg bg-white/70 px-3 py-2">
              <input type="checkbox" defaultChecked={role === 'user'} className="mr-2" />
              {role}
            </label>
          ))}
        </div>
      </aside>
    </div>
  )
}

function SketchTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('|')} className="border-b border-slate-100 last:border-0">
              {row.map((cell, index) => (
                <td
                  key={`${row.join('|')}-${cell}-${index}`}
                  className={`whitespace-nowrap px-4 py-3 ${
                    index === 0 ? 'font-medium text-slate-900' : 'text-slate-600'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
