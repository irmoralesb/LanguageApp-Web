import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/layout/MainLayout'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { LoginPage } from '@/features/login/LoginPage'
import { HomePage } from '@/features/home/HomePage'
import { ServiceCatalogPage } from '@/features/admin/ServiceCatalogPage'
import { RoleCatalogPage } from '@/features/admin/RoleCatalogPage'
import { RolePermissionsPage } from '@/features/admin/RolePermissionsPage'
import { UsersPage } from '@/features/admin/UsersPage'
import { UserServicesPage } from '@/features/admin/UserServicesPage'
import { UpdateProfilePage } from '@/features/profile/UpdateProfilePage'
import { ChangePasswordPage } from '@/features/profile/ChangePasswordPage'
import { PhrasalVerbsPage } from '@/features/phrasal-verbs/PhrasalVerbsPage'
import { PrepositionsPage } from '@/features/prepositions/PrepositionsPage'
import { MultiplePrepositionsPage } from '@/features/prepositions/MultiplePrepositionsPage'
import { PrepositionChoicePage } from '@/features/prepositions/PrepositionChoicePage'
import { ChatPracticePage } from '@/features/chat-practice/ChatPracticePage'
import { GermanNounsPage } from '@/features/german-nouns/GermanNounsPage'
import { GermanVerbsPage } from '@/features/german-verbs/GermanVerbsPage'
import { ServiceAccessRoute } from '@/auth/ServiceAccessRoute'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        {/* Administration — Sites */}
        <Route
          path="/admin/sites"
          element={
            <ProtectedRoute>
              <ServiceCatalogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sites/:serviceId/roles"
          element={
            <ProtectedRoute>
              <RoleCatalogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sites/:serviceId/roles/:roleId/permissions"
          element={
            <ProtectedRoute>
              <RolePermissionsPage />
            </ProtectedRoute>
          }
        />
        {/* Administration — Users */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:userId/services"
          element={
            <ProtectedRoute>
              <UserServicesPage />
            </ProtectedRoute>
          }
        />
        {/* English exercises */}
        <Route
          path="/phrasal-verbs"
          element={
            <ProtectedRoute>
              <ServiceAccessRoute serviceName="english-service">
                <PhrasalVerbsPage />
              </ServiceAccessRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prepositions"
          element={
            <ProtectedRoute>
              <ServiceAccessRoute serviceName="english-service">
                <PrepositionsPage />
              </ServiceAccessRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prepositions/multiple"
          element={
            <ProtectedRoute>
              <ServiceAccessRoute serviceName="english-service">
                <MultiplePrepositionsPage />
              </ServiceAccessRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prepositions/choice"
          element={
            <ProtectedRoute>
              <ServiceAccessRoute serviceName="english-service">
                <PrepositionChoicePage />
              </ServiceAccessRoute>
            </ProtectedRoute>
          }
        />
        {/* Chat Practice */}
        <Route
          path="/chat-practice"
          element={
            <ProtectedRoute>
              <ServiceAccessRoute serviceName="english-service">
                <ChatPracticePage />
              </ServiceAccessRoute>
            </ProtectedRoute>
          }
        />
        {/* German */}
        <Route
          path="/german/nouns"
          element={
            <ProtectedRoute>
              <ServiceAccessRoute serviceName="deutsch-service">
                <GermanNounsPage />
              </ServiceAccessRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/german/verbs"
          element={
            <ProtectedRoute>
              <ServiceAccessRoute serviceName="deutsch-service">
                <GermanVerbsPage />
              </ServiceAccessRoute>
            </ProtectedRoute>
          }
        />
        {/* Profile */}
        <Route
          path="/profile/update"
          element={
            <ProtectedRoute>
              <UpdateProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
