// React 18's UMD build has no jsx-runtime entry, so the automatic JSX transform is mapped onto
// createElement. Props already carry children; key and ref come out of props as createElement expects.
const React = window.React

// A board's attributes reach a component camel-cased: aria-label arrives as ariaLabel, data-id as
// dataId. A component that hands the rest of its props to an element would pass React a name it
// ignores, so a board could not label anything. On an element they go back to their attribute names.
const CAMEL = /^(aria|data)([A-Z])/
function attributes(props) {
  let out = props
  for (const k in props) {
    if (!CAMEL.test(k)) continue
    if (out === props) out = Object.assign({}, props)
    const name = k.replace(CAMEL, (_, prefix, c) => `${prefix}-${c.toLowerCase()}`).replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
    if (!(name in out)) out[name] = out[k]
    delete out[k]
  }
  return out
}

function jsx(type, props, key) {
  const p = typeof type === "string" && props ? attributes(props) : props
  return key === undefined ? React.createElement(type, p) : React.createElement(type, Object.assign({}, p, { key }))
}

module.exports = { jsx, jsxs: jsx, jsxDEV: jsx, Fragment: React.Fragment, attributes }
