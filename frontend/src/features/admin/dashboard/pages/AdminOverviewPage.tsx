import { useTranslation } from 'react-i18next'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { useAuth } from '@/features/auth/AuthProvider'
import { AdminMetricCard } from '@/features/admin/dashboard/components/AdminMetricCard'
import { AdminQuickActions } from '@/features/admin/dashboard/components/AdminQuickActions'
import { AdminWelcome } from '@/features/admin/dashboard/components/AdminWelcome'
import { RecentBookingsPreview } from '@/features/admin/dashboard/components/RecentBookingsPreview'
import { RecentMessagesPreview } from '@/features/admin/dashboard/components/RecentMessagesPreview'
import {
  useActiveCategoriesCountQuery,
  useActiveServicesCountQuery,
} from '@/features/admin/dashboard/queries/useAdminCatalogSummaryQuery'
import {
  useAdminBookingsPreviewQuery,
  useAdminPendingBookingsCountQuery,
} from '@/features/admin/dashboard/queries/useAdminBookingsPreviewQuery'
import {
  useAdminMessagesPreviewQuery,
  useAdminNewMessagesCountQuery,
} from '@/features/admin/dashboard/queries/useAdminMessagesPreviewQuery'
import { env } from '@/shared/config/env'
import { useAdminUsersCountQuery } from '@/features/admin/dashboard/queries/useAdminUsersCountQuery'
import '@/features/admin/dashboard/styles/admin-overview.css'

export function AdminOverviewPage() {
  const { t } = useTranslation('admin')
  const { user } = useAuth()

  const usersCount = useAdminUsersCountQuery()
  const bookingsPreview = useAdminBookingsPreviewQuery(env.features.bookings)
  const pendingCount = useAdminPendingBookingsCountQuery(env.features.bookings)
  const messagesPreview = useAdminMessagesPreviewQuery()
  const newMessagesCount = useAdminNewMessagesCountQuery()
  const activeServices = useActiveServicesCountQuery()
  const activeCategories = useActiveCategoriesCountQuery()

  useDocumentMeta({
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  return (
    <div className="admin-overview-page">
      <AdminWelcome user={user} />

      <section
        className="admin-metrics"
        aria-labelledby="admin-metrics-heading"
      >
        <h2 id="admin-metrics-heading" className="visually-hidden">
          {t('metricsHeading')}
        </h2>
        <div className="admin-metrics-grid">
          <AdminMetricCard
            label={t('metricRegisteredUsers')}
            value={usersCount.data ?? null}
            hint={t('metricRegisteredUsersHint')}
            loading={usersCount.isPending}
            error={usersCount.isError}
            errorLabel={t('metricUnavailable')}
            retryLabel={t('retry')}
            onRetry={() => {
              void usersCount.refetch()
            }}
            href="/admin/users"
            hrefLabel={t('viewUsers')}
          />
          <AdminMetricCard
            label={t('metricActiveCategories')}
            value={activeCategories.data ?? null}
            hint={t('metricActiveCategoriesHint')}
            loading={activeCategories.isPending}
            error={activeCategories.isError}
            errorLabel={t('metricUnavailable')}
            retryLabel={t('retry')}
            onRetry={() => {
              void activeCategories.refetch()
            }}
            href="/admin/categories"
            hrefLabel={t('viewCategories')}
          />
          <AdminMetricCard
            label={t('metricActiveServices')}
            value={activeServices.data ?? null}
            hint={t('metricActiveServicesHint')}
            loading={activeServices.isPending}
            error={activeServices.isError}
            errorLabel={t('metricUnavailable')}
            retryLabel={t('retry')}
            onRetry={() => {
              void activeServices.refetch()
            }}
            href="/admin/services"
            hrefLabel={t('viewServices')}
          />
          {env.features.bookings ? (
            <>
              <AdminMetricCard
                label={t('metricTotalBookings')}
                value={bookingsPreview.data?.total ?? null}
                hint={t('metricTotalBookingsHint')}
                loading={bookingsPreview.isPending}
                error={bookingsPreview.isError}
                errorLabel={t('metricUnavailable')}
                retryLabel={t('retry')}
                onRetry={() => {
                  void bookingsPreview.refetch()
                }}
                href="/admin/bookings"
                hrefLabel={t('viewBookings')}
              />
              <AdminMetricCard
                label={t('metricPendingBookings')}
                value={pendingCount.data ?? null}
                hint={t('metricPendingBookingsHint')}
                loading={pendingCount.isPending}
                error={pendingCount.isError}
                errorLabel={t('metricUnavailable')}
                retryLabel={t('retry')}
                onRetry={() => {
                  void pendingCount.refetch()
                }}
                href="/admin/bookings"
                hrefLabel={t('viewBookings')}
              />
            </>
          ) : null}
          <AdminMetricCard
            label={t('metricNewMessages')}
            value={newMessagesCount.data ?? null}
            hint={t('metricNewMessagesHint')}
            loading={newMessagesCount.isPending}
            error={newMessagesCount.isError}
            errorLabel={t('metricUnavailable')}
            retryLabel={t('retry')}
            onRetry={() => {
              void newMessagesCount.refetch()
            }}
            href="/admin/contact-messages"
            hrefLabel={t('viewMessages')}
          />
        </div>
      </section>

      <AdminQuickActions />

      <div className="admin-overview-previews">
        {env.features.bookings ? <RecentBookingsPreview query={bookingsPreview} /> : null}
        <RecentMessagesPreview query={messagesPreview} />
      </div>

      <aside className="admin-overview-notice" aria-labelledby="admin-notice-heading">
        <h2 id="admin-notice-heading">{t('noticeTitle')}</h2>
        <p>{t('noticeBody')}</p>
      </aside>
    </div>
  )
}
