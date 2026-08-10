import { CheckIcon } from './icons'
import { CardFoot, CardHead } from './CardParts'

/**
 * Already-booked items read as done rather than free. The tick and its colour
 * match the summary column's paid lines, so one item looks the same in both.
 */
const PaidLabel = () => (
  <span className="rcard-paid text-fg-range-optimal-primary-100">
    <CheckIcon size={13} />
    Paid
  </span>
)

/**
 * An add-on service. Figma 315:70020.
 *
 * Same shape as the Baseline card — image, name, sub-line, contribution ring,
 * rule, then what it refreshes against its price — so the whole column reads as
 * one list of things that close the gap, differing only in how much each closes.
 */
export function ProductCard({ product, outdatedTotal, selected, onToggle, money }) {
  const handleToggle = (event) => {
    event?.stopPropagation?.()
    if (!product.paid) onToggle()
  }

  return (
    <div
      className={`card rcard pcard rounded-3xl border-br-neutral-tertiary-100 ${selected && !product.paid ? 'pcard--on' : ''}`}
      data-on={selected && !product.paid ? '1' : '0'}
      role="checkbox"
      aria-checked={selected || product.paid}
      aria-disabled={product.paid || undefined}
      tabIndex={product.paid ? -1 : 0}
      onClick={handleToggle}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleToggle(event)
        }
      }}
    >
      <CardHead
        image={product.image}
        title={<span className="typography-body-300-medium">{product.name}</span>}
        subtitle={
          product.why && (
            <span className="text-fg-neutral-secondary-100 typography-body-200-regular" style={{ marginTop: 4 }}>
              {product.why}
            </span>
          )
        }
        price={product.paid ? <PaidLabel /> : money(product.priceToShow)}
        priceNote={product.paid ? 'Booking pending' : product.priceSubtitle}
      />

      <div className="rcard-rule border-br-neutral-tertiary-100" />

      <CardFoot
        count={product.markerCount}
        label={product.contribution > 0 ? 'Biomarkers refreshed' : 'Outside your outdated markers'}
        fraction={outdatedTotal ? product.contribution / outdatedTotal : 0}
        ringLabel={`${product.contribution} of ${outdatedTotal} outdated biomarkers refreshed`}
        price={product.paid ? <PaidLabel /> : money(product.priceToShow)}
        priceNote={product.paid ? 'Booking pending' : product.priceSubtitle}
        action={product.paid ? 'Paid' : selected ? 'Added' : 'Add'}
        actionDisabled={product.paid}
        onAction={handleToggle}
      />
    </div>
  )
}
