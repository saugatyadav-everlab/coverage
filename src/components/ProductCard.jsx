import { DS } from '../ds/loadDs'
import { ProgressRing } from './charts'
import { CheckIcon, TickIcon } from './icons'
import { contributionShare } from '../data/products'

/** The circular selection control: empty, ticked, or locked-and-ticked (paid). */
function SelectionBox({ selected, locked }) {
  if (selected || locked) {
    return (
      <span
        className="cbox bg-bg-neutral-primary-100 text-fg-neutral-primary-invert-100"
        style={{ flex: 'none', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CheckIcon />
      </span>
    )
  }
  return (
    <span
      className="cbox border-br-neutral-secondary-100"
      style={{ flex: 'none', width: 22, height: 22, borderRadius: '50%', borderWidth: 1.4, borderStyle: 'solid' }}
    />
  )
}

function CardFooter({ product, outdatedTotal, selected, onToggle, money }) {
  // The item's own contribution drives both the ring and the percentage —
  // nothing here is passed in pre-computed.
  const contributes = product.contribution > 0
  const share = contributionShare(product, outdatedTotal)

  const priceLabel = product.paid ? 'Paid' : money(product.priceToShow)
  const priceSub = product.paid ? 'Booking pending' : product.priceSubtitle

  return (
    <div className="cfoot border-br-neutral-tertiary-100" style={{ marginTop: 16 }}>
      <span className="cring">
        <ProgressRing fraction={outdatedTotal && contributes ? product.contribution / outdatedTotal : 0} />
      </span>

      <div className="cmk">
        <div className="typography-body-200-regular">{product.markerCount} markers</div>
        <div className="text-fg-neutral-tertiary-100 typography-body-100-regular" style={{ marginTop: 2 }}>
          {contributes ? `${share}% of outdated markers` : 'Outside your outdated markers'}
        </div>
      </div>

      <span className="cdiv border-br-neutral-tertiary-100" />

      <div className="cfr">
        <div className="typography-body-300-medium">{priceLabel}</div>
        {priceSub && (
          <div className="text-fg-neutral-tertiary-100 typography-body-100-regular" style={{ marginTop: 2 }}>
            {priceSub}
          </div>
        )}
      </div>

      <span className="addbtn">
        <DS.Button
          emphasis="secondary"
          appearance="neutral"
          size="sm"
          disabled={product.paid}
          onClick={onToggle}
        >
          {product.paid ? 'Paid' : selected ? 'Added' : 'Add'}
        </DS.Button>
      </span>
    </div>
  )
}

export function ProductCard({ product, outdatedTotal, selected, onToggle, money, footerExtra = null }) {
  const isMembership = product.kind === 'membership'
  const borderClass = selected && !product.paid ? 'border-br-neutral-primary-100' : 'border-br-neutral-tertiary-100'

  const handleToggle = (event) => {
    event?.stopPropagation?.()
    if (!product.paid) onToggle()
  }

  return (
    <div
      className={`card rounded-2xl ${borderClass}`}
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
      <div className="chead">
        {isMembership ? (
          <div
            className="mtile"
            style={{
              backgroundImage: `url(${product.image ?? '/assets/member-card.png'})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        ) : (
          <div className="atile rounded-lg bg-bg-neutral-tertiary-100">
            {product.image && <img src={product.image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
          </div>
        )}

        <div className="cmeta">
          <div className="typography-body-300-medium">{product.name}</div>
          {product.why && (
            <div className="text-fg-neutral-secondary-100 typography-body-200-regular" style={{ marginTop: 5 }}>
              {product.why}
            </div>
          )}
        </div>

        <SelectionBox selected={selected} locked={product.paid} />
      </div>

      {product.perks?.length > 0 && (
        <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column' }}>
          {product.perks.map((perk, index) => (
            <div
              key={perk}
              className="border-br-neutral-tertiary-100"
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: '14px 0',
                borderBottomWidth: index === product.perks.length - 1 ? 0 : 1,
                borderBottomStyle: 'solid',
              }}
            >
              <span className="text-fg-range-optimal-primary-100" style={{ flex: 'none', display: 'flex', paddingTop: 1 }}>
                <TickIcon />
              </span>
              <span className="typography-body-200-regular" style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                {perk}
              </span>
            </div>
          ))}
        </div>
      )}

      <CardFooter
        product={product}
        outdatedTotal={outdatedTotal}
        selected={selected}
        onToggle={handleToggle}
        money={money}
      />

      {footerExtra}
    </div>
  )
}
