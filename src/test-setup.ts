window.matchMedia = window.matchMedia || ((q: string) => ({ matches: false, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList)
class RO { observe() {} unobserve() {} disconnect() {} }
;(globalThis as unknown as { ResizeObserver: typeof RO }).ResizeObserver = RO

// jsdom does not implement pseudo-element styles (Ant Design asks for them); ignore the pseudo argument
const realGcs = window.getComputedStyle.bind(window)
window.getComputedStyle = ((el: Element) => realGcs(el)) as typeof window.getComputedStyle
