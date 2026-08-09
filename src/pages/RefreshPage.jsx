import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { DS } from '../ds/loadDs'
import { PageShell } from '../components/PageShell'
import { ProductCard } from '../components/ProductCard'
import { AtHomeAddOn } from '../components/AtHomeAddOn'
import { MobileSummaryBar, mobileBarVariant } from '../components/MobileSummaryBar'
import { CoverageSummaryCard, SummaryLineItems, TotalsCard } from '../components/SummaryParts'
import { useCoverage } from '../data/CoverageProvider'
import { computeSelection } from '../data/products'
import { AT_HOME } from '../data/atHome'
import { summaryLines } from '../data/summary'
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

function SummaryPanel({ selection, membership, money, onCheckout, checkoutLabel }) {
  const lines = summaryLines(selection, membership, money)

  return (
    <div className="side">
      <div className="seclabel typography-body-400-medium">Summary</div>
      {/* Both of these move into the sticky bar on narrow layouts — see app.css. */}
      <div className="side-coverage">
        <CoverageSummaryCard selection={selection} />
      </div>
      <SummaryLineItems lines={lines} />
      <TotalsCard selection={selection} money={money} />

      {/* Wrapped rather than classed: DS.Button doesn't forward className. */}
      <span className="side-cta" style={{ display: 'flex' }}>
        <DS.Button
          emphasis="primary"
          appearance="neutral"
          size="lg"
          disabled={!selection.anySelected}
          onClick={onCheckout}
          className="w-full"
        >
          {checkoutLabel}
        </DS.Button>
      </span>
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
        <div style={{ maxWidth: 1180, margin: '0 auto' }} data-mobilebar={barVariant}>
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
