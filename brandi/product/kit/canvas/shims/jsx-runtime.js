// React 18's UMD build has no jsx-runtime entry, so the automatic JSX transform is mapped onto
// createElement. Props already carry children; key and ref come out of props as createElement expects.
const React = window.React

function jsx(type, props, key) {
  return key === undefined ? React.createElement(type, props) : React.createElement(type, Object.assign({}, props, { key }))
}

module.exports = { jsx, jsxs: jsx, jsxDEV: jsx, Fragment: React.Fragment }
