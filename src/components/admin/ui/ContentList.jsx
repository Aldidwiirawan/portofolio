import { IconButton } from './Button'
import { Badge } from './Card'
import { IconArrowDown, IconArrowUp, IconEyeOff, IconImage, IconStar } from './icons'

/** List thumbnail: the image (decorative, the title sits next to it) or a placeholder icon. */
export function Thumb({ url, icon: Icon = IconImage, contain = false }) {
  return url ? (
    <img src={url} alt="" loading="lazy" className={contain ? 'is-contain' : undefined} />
  ) : (
    <span className="adm-list-media-placeholder" aria-hidden="true">
      <Icon size={22} />
    </span>
  )
}

/** "Unggulan" and "Disembunyikan" badges for a content row. */
export function DisplayBadges({ item }) {
  return (
    <>
      {item.is_featured && (
        <Badge tone="accent">
          <IconStar size={12} aria-hidden="true" /> Unggulan
        </Badge>
      )}
      {item.is_visible === false && (
        <Badge tone="neutral" className="adm-badge--hidden">
          <IconEyeOff size={12} aria-hidden="true" /> Disembunyikan
        </Badge>
      )}
    </>
  )
}

/**
 * "Naikkan" / "Turunkan" for one row of an ordered list. aria-disabled (not disabled) at the ends so
 * keyboard focus stays on the button after an item reaches the top or bottom.
 */
export function ReorderButtons({ reorder, list, index, name }) {
  const item = list[index]
  const locked = reorder.busy || reorder.locked
  return (
    <span className="adm-reorder" role="group" aria-label={`Urutan ${name}`}>
      <IconButton
        id={`reorder-${item.id}-up`}
        size="sm"
        label={`Naikkan ${name}`}
        icon={<IconArrowUp size={16} />}
        aria-disabled={index === 0 || locked || undefined}
        onClick={() => reorder.move(list, index, -1, name)}
      />
      <IconButton
        id={`reorder-${item.id}-down`}
        size="sm"
        label={`Turunkan ${name}`}
        icon={<IconArrowDown size={16} />}
        aria-disabled={index === list.length - 1 || locked || undefined}
        onClick={() => reorder.move(list, index, 1, name)}
      />
    </span>
  )
}

/** Live region for the reorder announcements. */
export function ReorderStatus({ reorder }) {
  return (
    <p className="adm-sr-only" role="status" aria-live="polite">
      {reorder.status}
    </p>
  )
}
