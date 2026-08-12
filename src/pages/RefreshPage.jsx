import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { DS } from '../ds/loadDs'
import { PageShell } from '../components/PageShell'
import { ProductCard } from '../components/ProductCard'
import { MembershipCard } from '../components/MembershipCard'
import { AtHomeAddOn } from '../components/AtHomeAddOn'
import { MobileSummaryBar } from '../components/MobileSummaryBar'
import { CoverageSummaryCard, SummaryLineItems, TotalsCard } from '../components/SummaryParts'
import { SectionHeading } from '../components/CardParts'
import { useCoverage } from '../data/CoverageProvider'
import { computeSelection } from '../data/products'
import { AT_HOME } from '../data/atHome'
import { summaryLines } from '../data/summary'
import { ACTION, MESSAGE, emit, emitAction } from '../data/host'
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

function SummaryPanel({ selection, membership, money, order, onCheckout, checkoutLabel }) {
  const lines = summaryLines(selection, membership, money, order)

  return (
    <div className="side">
      {/* Same treatment as the two section headings in the left column. */}
      <SectionHeading>Summary</SectionHeading>

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
  // The sequence everything was picked in, so the summary can list it that way.
  // Kept alongside the selection flags rather than replacing them: the plan and
  // its at-home draw have their own rules, and this only records the order.
  const [order, setOrder] = useState([])

  const mark = (key, on) =>
    setOrder((current) => {
      const without = current.filter((k) => k !== key)
      return on ? [...without, key] : without
    })

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
        atHome: AT_HOME.enabled ? AT_HOME : null,
        atHomeSelected,
      }),
    [membership, products, outdated, selectedIds, membershipSelected, atHomeSelected],
  )

  // Dropping the plan drops its add-on with it, so re-selecting the plan never
  // silently re-adds a charge the member last saw attached to something else.
  const toggleMembership = () => {
    const on = !membershipSelected
    setMembershipSelected(on)
    mark('membership', on)
    if (!on) {
      setAtHomeSelected(false)
      mark(AT_HOME.id, false)
    }
  }

  const toggleAtHome = () => {
    const on = !atHomeSelected
    setAtHomeSelected(on)
    mark(AT_HOME.id, on)
  }

  const toggleProduct = (id) => {
    const on = !selectedIds.includes(id)
    setSelectedIds(on ? [...selectedIds, id] : selectedIds.filter((x) => x !== id))
    mark(id, on)
  }

  /**
   * The checkout button hands off to the embedding app, which opens its own
   * checkout. Every selected item's `id` is a PriceDefinition id (they come
   * straight from the host's entry payload), so the host takes the flat list
   * as-is — this page deliberately does not implement checkout itself.
   */
  const handleCheckout = () => {
    const priceDefinitionIds = [
      membershipSelected ? membership?.id : null,
      selection.atHomeCharged ? AT_HOME.id : null,
      ...selection.chosen.map((product) => product.id),
    ].filter(Boolean)

    emitAction(ACTION.CHECKOUT, { priceDefinitionIds })
  }

  const priced = products.map((product) => withPricing(product, selection.isMember, money))
  const membershipCard = membership ? withPricing(membership, selection.isMember, money) : null

  // Ordered by what each item actually does about the gap: biggest contribution
  // first, already-paid last since they need no decision. `recommended` is a
  // badge on the card, not a position — leading with an item that refreshes
  // nothing, above one that closes thirty markers, reads as incoherent.
  const addons = [...priced].sort(
    (a, b) => Number(a.paid) - Number(b.paid) || b.contribution - a.contribution,
  )

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
            <div className="pagetitle typography-display-300">Refresh your biomarkers</div>
          </div>

          <div className="cols">
            <div className="rcolumn">
              {membershipCard && (
                <div className="rsection">
                  {/* The plan and its delivery option share one frame, so the
                      at-home draw reads as part of the same offer rather than a
                      separate purchase. */}
                  <div className="baseline-frame bg-bg-surface-200 rounded-3xl" data-on={membershipSelected ? '1' : '0'}>
                    <MembershipCard
                      product={membershipCard}
                      outdatedTotal={selection.outdatedTotal}
                      selected={membershipSelected}
                      onToggle={toggleMembership}
                      money={money}
                    />
                    {AT_HOME.enabled && (
                      <AtHomeAddOn open={membershipSelected} selected={atHomeSelected} onToggle={toggleAtHome} />
                    )}
                  </div>
                </div>
              )}

              {addons.length > 0 && (
                <div className="rsection">
                  <SectionHeading>Go further for full coverage</SectionHeading>
                  <div className="rcards">{addons.map(renderCard)}</div>
                </div>
              )}
            </div>

            <SummaryPanel
              selection={selection}
              membership={membershipCard}
              money={money}
              order={order}
              onCheckout={handleCheckout}
              checkoutLabel="Continue to checkout"
            />
          </div>

          <MobileSummaryBar selection={selection} onCheckout={handleCheckout} />
        </div>
      </div>
    </PageShell>
  )
}
