import { TickIcon } from './icons'
import { CardFoot, CardHead } from './CardParts'

/**
 * The Baseline card, sold as the blood test rather than as a membership.
 *
 * This is the fix for the narrative break: a member arrives having just been
 * told 36 of their markers are out of date, so the card leads with the thing
 * that refreshes them. The membership is still what's being bought — it's just
 * introduced as what the test is included in, once the test has been
 * established, rather than as an unexplained subscription.
 *
 * Figma 315:70020. The card is white and sits inside a tinted frame that also
 * holds the at-home row, so the two read as one offer.
 */
export function MembershipCard({ product, outdatedTotal, selected, onToggle, money }) {
  const handleToggle = (event) => {
    event?.stopPropagation?.()
    onToggle()
  }

  return (
    <div
      className="card rcard mcard rounded-3xl"
      data-on={selected ? '1' : '0'}
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
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
        title={
          // Same size as an add-on card's name, so the two card types read as
          // peers in one list rather than a headline followed by minor items.
          <span className="typography-body-300-medium">Blood test</span>
        }
        subtitle={
          <span className="text-fg-neutral-secondary-100 typography-body-200-regular" style={{ marginTop: 6 }}>
            At home test available for convenience
          </span>
        }
        price={money(product.price)}
        priceNote={product.priceNote}
      />

      <div className="rcard-rule border-br-neutral-tertiary-100" />

      <CardFoot
        count={product.markerCount}
        label="Biomarkers refreshed"
        fraction={outdatedTotal ? product.contribution / outdatedTotal : 0}
        ringLabel={`${product.contribution} of ${outdatedTotal} outdated biomarkers refreshed`}
        price={money(product.price)}
        priceNote={product.priceNote}
        action={selected ? 'Added' : 'Add'}
        onAction={handleToggle}
      />

      <div className="mcard-included rounded-lg">
        <div className="mcard-member">
          <span className="mcard-membercard" />
          {/* One sentence; the two spans differ only so the plan name can carry
              its own weight if that ever diverges again. */}
          <div className="mcard-member-text">
            <span className="typography-body-100-regular">Included as part of</span>
            <span className="typography-body-200-medium">{product.name}</span>
          </div>
        </div>

        {product.perks?.map((perk, index) => (
          <div key={perk} className="mcard-perk border-br-neutral-tertiary-100" data-first={index === 0 ? '1' : '0'}>
            <span className="text-fg-range-optimal-primary-100" style={{ flex: 'none', display: 'flex' }}>
              <TickIcon size={16} strokeWidth={2} />
            </span>
            <span className="typography-body-200-regular" style={{ flex: 1, minWidth: 0 }}>
              {perk}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
