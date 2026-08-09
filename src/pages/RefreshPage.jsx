import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { DS } from '../ds/loadDs'
import { PageShell } from '../components/PageShell'
import { ProductCard } from '../components/ProductCard'
import { AtHomeAddOn } from '../components/AtHomeAddOn'
import { MobileSummaryBar, mobileBarVariant } from '../components/MobileSummaryBar'
import { SummaryRing } from '../components/charts'
import { BasketIcon, CheckIcon } from '../components/icons'
import { useCoverage } from '../data/CoverageProvider'
import { computeSelection } from '../data/products'
import { AT_HOME } from '../data/atHome'
import { MESSAGE, emit } from '../data/host'
import { formatMoney } from '../data/format'

/** Prices depend on whether the membership is in the basket, so decorate late. */
function withPricing(product, isMember, money) {
  const priceToShow = isMember ? product.memberPrice : product.price
  const saving = product.price - product.memberPrice

  let priceSubtitle = product.priceNote
  if (!priceSubtitle && product.kind !== 'membership' && saving > 0) {
    priceSubtitle = isMember ? `Saving ${money(saving)} as member` : `Member price · ${money(product.memberPrice)}`
  }

  return { ...product, priceToShow, priceSubtitle }
}

export function summaryLines(selection, membership, money) {
  const { chosen, paid, isMember, atHomeCharged } = selection
  return [
    ...(isMember && membership ? [{ key: 'membership', name: membership.name, price: money(membership.price), paid: false }] : []),
    ...(atHomeCharged ? [{ key: AT_HOME.id, name: AT_HOME.summaryName, price: money(AT_HOME.price), paid: false }] : []),
    ...chosen.map((product) => ({ key: product.id, name: product.name, price: money(selection.priceOf(product)), paid: false })),
    ...paid.map((product) => ({ key: product.id, name: product.name, price: 'Paid', paid: true })),
  ]
}

function SummaryPanel({ selection, membership, money, onCheckout, checkoutLabel }) {
  const { refreshed, outdatedTotal, fraction, subtotal, saved, total, anySelected } = selection
  const lines = summaryLines(selection, membership, money)

  return (
    <div className="side">
      <div className="seclabel typography-body-400-medium">Summary</div>

      <div
        className="rounded-2xl border-br-neutral-tertiary-100"
        style={{ borderWidth: 1, borderStyle: 'solid', padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}
      >
        <SummaryRing fraction={fraction} label={`${refreshed} of ${outdatedTotal} outdated biomarkers refreshed`} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="typography-display-100">{refreshed}</div>
          <div className="text-fg-neutral-secondary-100 typography-body-200-regular" style={{ marginTop: 3, lineHeight: 1.4 }}>
            Outdated biomarkers being refreshed
          </div>
        </div>
      </div>

      {lines.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
          {lines.map((line, index) => (
            <div key={line.key} className="sumitem border-br-neutral-tertiary-100" style={{ borderBottomWidth: index === lines.length - 1 ? 0 : 1 }}>
              <span className="bg-bg-neutral-primary-100" style={{ flex: 'none', width: 6, height: 6 }} />
              <span className="typography-body-200-regular" style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
                {line.name}
              </span>
              <span
                className={`${line.paid ? 'text-fg-range-optimal-primary-100' : ''} typography-body-200-regular`}
                style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {line.paid && <CheckIcon size={13} />}
                {line.price}
              </span>
            </div>
          ))}
        </div>
      )}

      {lines.length === 0 && (
        <div style={{ padding: '22px 10px 6px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <span
            className="bg-bg-neutral-tertiary-100 text-fg-neutral-primary-100"
            style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <BasketIcon />
          </span>
          <div>
            <div className="typography-body-300-medium">Nothing selected yet.</div>
            <div className="text-fg-neutral-secondary-100 typography-body-200-regular" style={{ marginTop: 6, lineHeight: 1.5 }}>
              As you add items, you can see how much they contribute to refreshing your outdated biomarkers.
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-bg-neutral-tertiary-100" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span className="typography-body-200-regular" style={{ flex: 1 }}>
            Subtotal
          </span>
          <span className="typography-body-200-regular" style={{ flex: 'none' }}>
            {money(subtotal)}
          </span>
        </div>

        {saved > 0 && (
          <div
            className="border-br-neutral-tertiary-100"
            style={{ display: 'flex', alignItems: 'baseline', gap: 12, paddingTop: 14, borderTopWidth: 1, borderTopStyle: 'solid' }}
          >
            <span className="typography-body-200-regular" style={{ flex: 1 }}>
              Member discount
            </span>
            <span className="text-fg-range-optimal-primary-100 typography-body-200-regular" style={{ flex: 'none' }}>
              -{money(saved)}
            </span>
          </div>
        )}

        <div
          className="border-br-neutral-tertiary-100"
          style={{ display: 'flex', alignItems: 'baseline', gap: 12, paddingTop: 14, borderTopWidth: 1, borderTopStyle: 'solid' }}
        >
          <div style={{ flex: 1 }}>
            <div className="typography-body-400-medium">Total</div>
            <div className="text-fg-neutral-tertiary-100 typography-body-100-regular" style={{ marginTop: 2 }}>
              (GST inc.)
            </div>
          </div>
          <span className="typography-body-500-medium" style={{ flex: 'none' }}>
            {money(total)}
          </span>
        </div>
      </div>

      <DS.Button emphasis="primary" appearance="neutral" size="lg" disabled={!anySelected} onClick={onCheckout} className="w-full">
        {checkoutLabel}
      </DS.Button>
    </div>
  )
}

export default function RefreshPage() {
  const navigate = useNavigate()
  const { payload, catalogue } = useCoverage()
  const { membership, products, outdated } = catalogue

  const [membershipSelected, setMembershipSelected] = useState(false)
  const [atHomeSelected, setAtHomeSelected] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const barVariant = mobileBarVariant()

  const money = useMemo(
    () => (amount) => formatMoney(amount, { currency: payload.currency, locale: payload.locale }),
    [payload.currency, payload.locale],
  )

  const selection = useMemo(
    () =>
      computeSelection({
        membership,
        products,
        outdated,
        selectedIds,
        membershipSelected,
        atHome: AT_HOME,
        atHomeSelected,
      }),
    [membership, products, outdated, selectedIds, membershipSelected, atHomeSelected],
  )

  // Dropping the plan drops its add-on with it, so re-selecting the plan never
  // silently re-adds a charge the member last saw attached to something else.
  const toggleMembership = () =>
    setMembershipSelected((on) => {
      if (on) setAtHomeSelected(false)
      return !on
    })

  const toggleProduct = (id) =>
    setSelectedIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))

  /**
   * The checkout button hands off to the embedding app, which opens its own
   * modal. This page deliberately does not implement the modal.
   */
  const handleCheckout = () => {
    emit(MESSAGE.CHECKOUT, {
      selection: {
        membership: membershipSelected ? { id: membership?.id, name: membership?.name, price: membership?.price } : null,
        atHome: selection.atHomeCharged ? { id: AT_HOME.id, name: AT_HOME.name, price: AT_HOME.price } : null,
        productIds: selection.chosen.map((product) => product.id),
        products: selection.chosen.map((product) => ({
          id: product.id,
          name: product.name,
          price: selection.priceOf(product),
        })),
      },
      totals: {
        subtotal: selection.subtotal,
        discount: selection.saved,
        total: selection.total,
        currency: payload.currency,
      },
      coverage: {
        refreshed: selection.refreshed,
        outdated: selection.outdatedTotal,
        remaining: selection.remaining,
      },
    })
  }

  const priced = products.map((product) => withPricing(product, selection.isMember, money))
  const membershipCard = membership ? withPricing(membership, selection.isMember, money) : null

  // `recommended` decides which of the comps' two sections an item sits in.
  // An item can be recommended and still contribute nothing to the outdated
  // pile — a first-time test belongs under "Recommended" just as much.
  const recommended = priced.filter((product) => product.recommended)
  const further = priced.filter((product) => !product.recommended)

  const renderCard = (product) => (
    <ProductCard
      key={product.id}
      product={product}
      outdatedTotal={selection.outdatedTotal}
      selected={selectedIds.includes(product.id)}
      onToggle={() => toggleProduct(product.id)}
      money={money}
    />
  )

  return (
    <PageShell
      onLogoClick={() => {
        emit(MESSAGE.NAVIGATE, { page: 'bridge' })
        navigate({ pathname: '/', search: window.location.search })
      }}
    >
      <div className="page page--refresh">
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ padding: '30px 0 26px' }}>
            <div className="pagetitle typography-display-300">Refresh your outdated biomarkers</div>
          </div>

          <div className="cols">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {(membershipCard || recommended.length > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {membershipCard && (
                    <ProductCard
                      product={membershipCard}
                      outdatedTotal={selection.outdatedTotal}
                      selected={membershipSelected}
                      onToggle={toggleMembership}
                      money={money}
                      footerExtra={
                        <AtHomeAddOn
                          open={membershipSelected}
                          selected={atHomeSelected}
                          onToggle={() => setAtHomeSelected((on) => !on)}
                          money={money}
                        />
                      }
                    />
                  )}
                  {recommended.map(renderCard)}
                </div>
              )}

              {further.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="seclabel typography-body-400-medium">Go further for full coverage</div>
                  {further.map(renderCard)}
                </div>
              )}
            </div>

            <SummaryPanel
              selection={selection}
              membership={membershipCard}
              money={money}
              onCheckout={handleCheckout}
              checkoutLabel="Continue to checkout"
            />
          </div>

          <MobileSummaryBar
            variant={barVariant}
            selection={selection}
            lines={summaryLines(selection, membershipCard, money)}
            money={money}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </PageShell>
  )
}
