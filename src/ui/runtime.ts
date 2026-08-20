/**
 * Handles onto Vue and Codex internals, handed over by bootstrap().
 *
 * Neither library is bundled — both arrive through mw.loader at runtime — so these can't
 * be imported, and everything reading them has to cope with their being unset.
 */

/**
 * Codex's TableRowIdentifier symbol, handed over by bootstrap once Codex has loaded.
 *
 * Without it CdxTable keys rows by their array index, so inserting or removing a row
 * re-patches every row after it, and per-row child state (a lookup's suggestions, an
 * expiry input's touched flag) stays attached to the position rather than the account.
 */
export let tableRowIdentifier: symbol | null = null;
export function setTableRowIdentifier(identifier: symbol) {
  tableRowIdentifier = identifier;
}

type ToRaw = <T>(observed: T) => T;
let vueToRaw: ToRaw | null = null;
export function setToRaw(toRawArg: ToRaw) {
  vueToRaw = toRawArg;
}

/**
 * Vue's toRaw, falling back to identity until Vue has loaded
 */
export function toRaw<T>(observed: T): T {
  return vueToRaw ? vueToRaw(observed) : observed;
}

type MarkRaw = <T extends object>(value: T) => T;
let vueMarkRaw: MarkRaw | null = null;
export function setMarkRaw(markRawArg: MarkRaw) {
  vueMarkRaw = markRawArg;
}

/**
 * Vue's markRaw, falling back to identity until Vue has loaded
 */
export function markRaw<T extends object>(value: T): T {
  return vueMarkRaw ? vueMarkRaw(value) : value;
}
