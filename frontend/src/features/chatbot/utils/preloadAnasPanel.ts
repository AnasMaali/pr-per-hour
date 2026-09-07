type AnasPanelModule = typeof import('@/features/chatbot/components/AnasPanel')

let modulePromise: Promise<AnasPanelModule> | null = null

/**
 * Memoized dynamic import of the AnasPanel chunk (conversation UI, GSAP
 * entrance/exit timeline, markdown rendering). Shared by the `lazy()`
 * definition that actually renders the panel and by `preloadAnasPanel()`
 * below, so a visitor who hovers/focuses/presses the launcher before the
 * panel opens gets a head start: by the time `lazy()` needs the module,
 * the fetch is already in flight or has already resolved from cache.
 */
export function loadAnasPanelModule(): Promise<AnasPanelModule> {
  if (!modulePromise) {
    modulePromise = import('@/features/chatbot/components/AnasPanel')
  }
  return modulePromise
}

/** Fire-and-forget: start fetching the panel chunk without waiting on it. */
export function preloadAnasPanel(): void {
  void loadAnasPanelModule()
}
