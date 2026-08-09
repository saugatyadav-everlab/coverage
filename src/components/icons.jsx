/* One-off SVGs from the comps that aren't in the design system's icon set. */

export function InfoIcon({ size = 14 }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ width: size, height: size }} aria-hidden="true">
      <circle cx="8" cy="8" r="6.4" />
      <line x1="8" x2="8" y1="7.2" y2="11.2" strokeLinecap="round" />
      <circle cx="8" cy="4.9" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function StaleWarningIcon({ size = 14 }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="text-fg-sentiment-warning-100"
      style={{ width: size, height: size, flex: 'none' }}
      role="img"
      aria-label="Measured before your most recent test"
    >
      <path d="M8 2.6 15 14.4H1L8 2.6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <line x1="8" x2="8" y1="6.6" y2="9.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11.8" r="0.8" fill="currentColor" />
    </svg>
  )
}

export function TickIcon({ size = 15, strokeWidth = 1.8 }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" style={{ width: size, height: size }} aria-hidden="true">
      <path d="M3 8.4 6.1 11.4 13 4.6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CheckIcon({ size = 12 }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" style={{ width: size, height: size }} aria-hidden="true">
      <path d="M3.5 8.4 6.3 11.2 12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BasketIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="12 12 20 20" fill="none" style={{ display: 'block' }} aria-hidden="true">
      <path
        d="M18.6666 27.8335C19.5871 27.8335 20.3333 28.5797 20.3333 29.5002C20.3333 30.4206 19.5871 31.1668 18.6666 31.1668C17.7461 31.1668 16.9999 30.4206 16.9999 29.5002C16.9999 28.5797 17.7461 27.8335 18.6666 27.8335ZM27.8333 27.8335C28.7537 27.8335 29.4999 28.5797 29.4999 29.5002C29.4999 30.4206 28.7537 31.1668 27.8333 31.1668C26.9128 31.1668 26.1666 30.4206 26.1666 29.5002C26.1666 28.5797 26.9128 27.8335 27.8333 27.8335ZM15.448 12.8783C15.8093 12.9099 16.1122 13.174 16.1894 13.5342L16.9405 17.0417H30.4081C30.6608 17.0417 30.9002 17.1563 31.0583 17.3534C31.2165 17.5505 31.2767 17.809 31.2219 18.0557L29.8466 24.2471L29.8458 24.2463C29.7234 24.8016 29.4164 25.2991 28.9734 25.6558C28.5302 26.0125 27.9782 26.2074 27.4093 26.2083H19.2582V26.2075C18.6834 26.216 18.1227 26.027 17.6713 25.6704C17.2151 25.31 16.8989 24.8017 16.7769 24.2332L15.4569 18.0728C15.4527 18.0553 15.4487 18.0377 15.4456 18.0199L14.7009 14.5417H13.7081C13.2479 14.5416 12.8748 14.1685 12.8748 13.7083C12.8748 13.2482 13.2479 12.8751 13.7081 12.875H15.3748L15.448 12.8783ZM18.4062 23.8833C18.4468 24.0728 18.5528 24.2425 18.7048 24.3626C18.8568 24.4826 19.0459 24.5459 19.2395 24.5417H27.4068C27.5962 24.5413 27.78 24.4764 27.9277 24.3577C28.0754 24.2388 28.1782 24.0726 28.219 23.8874L28.2198 23.8857L29.3689 18.7083H17.2978L18.4062 23.8833Z"
        fill="currentColor"
      />
    </svg>
  )
}
