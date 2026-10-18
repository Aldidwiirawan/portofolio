import { useI18n } from '../../i18n/i18nContext'

/** Placeholder of a page that is still loading (lazy page or its data); announced once. */
export function PageSkeleton() {
  const { t } = useI18n()
  return (
    <div className="pub-container pub-page-skeleton" role="status">
      <span className="pub-sr-only">{t('common.loading')}</span>
      <span className="pub-skeleton" style={{ width: '7rem', height: '1.25rem' }} aria-hidden="true" />
      <span className="pub-skeleton" style={{ width: 'min(36rem, 90%)', height: '3rem' }} aria-hidden="true" />
      <span className="pub-skeleton" style={{ width: 'min(28rem, 75%)', height: '1.25rem' }} aria-hidden="true" />
      <span className="pub-skeleton" style={{ width: '100%', height: '16rem' }} aria-hidden="true" />
    </div>
  )
}
