import * as React from "react"

/** One ref callback that feeds every ref given, so a component can keep its own and forward the caller's. */
export function useMergedRef<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return React.useCallback((node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs)
}
