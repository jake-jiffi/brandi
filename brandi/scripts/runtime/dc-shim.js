/*
 * Brandi's Design Component runtime shim.
 *
 * Renders a .dc.html artboard outside the Design canvas: for local previews, for the Design
 * System's component previews, and for the quality gates, which need the mounted components drawn
 * before a detector or axe can look at them. The canvas's own runtime is Anthropic's and is never
 * copied; this implements the format its documentation describes: {{holes}} as dotted lookups,
 * x-import mounting a component from a global, dc-import mounting a sibling board, sc-for and
 * sc-if, helmet, data-props, and a DCLogic class with state, setState and React's lifecycles.
 *
 * React 18 and ReactDOM must already be on the page, as the canvas has them. When the board has
 * rendered, <html> gets data-dc-ready="1"; on a failure, data-dc-error holds the message and the
 * page shows it, so a screenshot never passes off a broken board as a blank one. data-dc-unfilled
 * names each hole whose first name neither the board's props nor its renderVals() give.
 *
 * Props for the board come from ?props={json} on the page's address (a dark twin, a state).
 */
(function () {
  'use strict';
  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var root = document.documentElement;
  if (!React || !ReactDOM) {
    root.setAttribute('data-dc-error', 'React and ReactDOM must load before dc-shim.js');
    return;
  }
  var h = React.createElement;
  var HOLE = /\{\{\s*([^}]*?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]*?)\s*\}\}\s*$/;

  // --- Holes ---------------------------------------------------------------
  // Each hole whose first name the board never gives, by its whole lookup. It renders as nothing, so a component
  // quietly drops what it would have drawn (a proposal lost its Edit and Not now to an unreturned noop).
  var unfilled = {};
  function lookup(expr, scope) {
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    if (expr === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
    if (/^'[^']*'$|^"[^"]*"$/.test(expr)) return expr.slice(1, -1);
    // Dotted lookups only: anything else renders as nothing, as the canvas renders it as literal text.
    if (!/^\$?[A-Za-z_][\w$]*(\.[A-Za-z_$][\w$]*|\.\d+)*$/.test(expr)) return undefined;
    var parts = expr.split('.');
    // A first name given whose later parts are null is data (no booking yet), not a fault.
    if (!(parts[0] in scope)) unfilled[expr] = 1;
    var v = scope;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }
  function interpolate(text, scope) {
    return text.replace(HOLE, function (_, e) {
      var v = lookup(e, scope);
      return v == null ? '' : String(v);
    });
  }
  function value(text, scope) {
    var m = WHOLE.exec(text);
    if (m) return lookup(m[1], scope);
    return text.indexOf('{{') >= 0 ? interpolate(text, scope) : text;
  }

  // --- Attributes ----------------------------------------------------------
  function camel(s) {
    return s.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
  }
  var ATTR = {
    class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength',
    minlength: 'minLength', colspan: 'colSpan', rowspan: 'rowSpan', autocomplete: 'autoComplete',
    autofocus: 'autoFocus', crossorigin: 'crossOrigin', datetime: 'dateTime', enctype: 'encType',
    srcset: 'srcSet', novalidate: 'noValidate', spellcheck: 'spellCheck', contenteditable: 'contentEditable',
    inputmode: 'inputMode', enterkeyhint: 'enterKeyHint', accesskey: 'accessKey', referrerpolicy: 'referrerPolicy',
  };
  var BOOL = { disabled: 1, checked: 1, selected: 1, hidden: 1, readonly: 1, required: 1, multiple: 1, open: 1, autofocus: 1, novalidate: 1, inert: 1 };
  var EVENTS = {
    click: 'Click', dblclick: 'DoubleClick', change: 'Change', input: 'Input', submit: 'Submit', focus: 'Focus',
    blur: 'Blur', keydown: 'KeyDown', keyup: 'KeyUp', mouseenter: 'MouseEnter', mouseleave: 'MouseLeave',
    mousedown: 'MouseDown', mouseup: 'MouseUp', pointerdown: 'PointerDown', pointerup: 'PointerUp',
    pointerenter: 'PointerEnter', pointerleave: 'PointerLeave', contextmenu: 'ContextMenu', scroll: 'Scroll',
  };
  function styleObject(css) {
    var o = {};
    String(css).split(';').forEach(function (decl) {
      var i = decl.indexOf(':');
      if (i < 0) return;
      var k = decl.slice(0, i).trim();
      if (!k) return;
      o[k.indexOf('--') === 0 ? k : camel(k)] = decl.slice(i + 1).trim();
    });
    return o;
  }
  function elementProps(node, scope) {
    var props = {};
    for (var i = 0; i < node.attributes.length; i++) {
      var name = node.attributes[i].name;
      var raw = node.attributes[i].value;
      var v = value(raw, scope);
      if (name === 'style') { props.style = typeof v === 'string' ? styleObject(v) : v; continue; }
      if (/^on[a-z]+$/.test(name)) {
        // Only a function from renderVals() becomes a handler. A string never runs.
        if (typeof v === 'function') props['on' + (EVENTS[name.slice(2)] || camel(name.slice(2)).replace(/^./, function (c) { return c.toUpperCase(); }))] = v;
        continue;
      }
      if (name.indexOf('data-') === 0 || name.indexOf('aria-') === 0) { props[name] = v; continue; }
      if (BOOL[name] && raw === '') { props[ATTR[name] || name] = true; continue; }
      props[ATTR[name] || name] = v;
    }
    return props;
  }

  // --- Templates -----------------------------------------------------------
  var DYNAMIC = /\{\{|<(x-import|dc-import|sc-for|sc-if)\b/i;
  function isStatic(node) {
    return !DYNAMIC.test(node.outerHTML);
  }
  function resolveGlobal(path) {
    var v = window;
    var parts = String(path || '').split('.');
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }
  function renderNodes(nodes, scope, ctx) {
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var r = renderNode(nodes[i], scope, ctx, i);
      if (r !== null && r !== undefined && r !== '') out.push(r);
    }
    return out;
  }
  function renderNode(node, scope, ctx, key) {
    if (node.nodeType === 3) {
      var text = node.nodeValue;
      var whole = WHOLE.exec(text);
      if (whole) {
        var v = lookup(whole[1], scope);
        if (v == null || v === false) return null;
        return typeof v === 'object' ? v : String(v);
      }
      return text.indexOf('{{') >= 0 ? interpolate(text, scope) : text;
    }
    if (node.nodeType !== 1) return null;
    var tag = node.localName;
    if (tag === 'helmet' || tag === 'script') return null;
    if (tag === 'sc-if') {
      return lookup((WHOLE.exec(node.getAttribute('value') || '') || [])[1] || '', scope)
        ? h(React.Fragment, { key: key }, renderNodes(node.childNodes, scope, ctx)) : null;
    }
    if (tag === 'sc-for') {
      var list = value(node.getAttribute('list') || '', scope);
      var as = node.getAttribute('as') || 'item';
      if (!Array.isArray(list)) return null;
      return h(React.Fragment, { key: key }, list.map(function (item, index) {
        var inner = Object.create(scope);
        inner[as] = item;
        inner.$index = index;
        return h(React.Fragment, { key: index }, renderNodes(node.childNodes, inner, ctx));
      }));
    }
    if (tag === 'x-import') return renderImport(node, scope, ctx, key);
    if (tag === 'dc-import') return renderBoardImport(node, scope, ctx, key);
    var props = elementProps(node, scope);
    props.key = key;
    // A static subtree is handed to the browser as it is: exact markup, SVG included.
    if (node.childNodes.length && isStatic(node) && tag !== 'textarea' && tag !== 'select') {
      props.dangerouslySetInnerHTML = { __html: node.innerHTML };
      return h(tag, props);
    }
    if (tag === 'textarea') {
      props.defaultValue = node.textContent;
      return h(tag, props);
    }
    var children = renderNodes(node.childNodes, scope, ctx);
    return h.apply(null, [tag, props].concat(children));
  }
  function importProps(node, scope, skip) {
    var props = {};
    var slot = null;
    for (var i = 0; i < node.attributes.length; i++) {
      var name = node.attributes[i].name;
      if (skip.indexOf(name) >= 0) continue;
      var v = value(node.attributes[i].value, scope);
      if (name === 'style') { slot = typeof v === 'string' ? styleObject(v) : v; continue; }
      props[ATTR[name] || camel(name)] = v;
    }
    return { props: props, slot: slot };
  }
  function renderImport(node, scope, ctx, key) {
    var path = node.getAttribute('component-from-global-scope');
    var Comp = resolveGlobal(path);
    var p = importProps(node, scope, ['component-from-global-scope']);
    var children = renderNodes(node.childNodes, scope, ctx);
    if (children.length) p.props.children = children.length === 1 ? children[0] : children;
    if (typeof Comp !== 'function' && !(Comp && typeof Comp === 'object' && Comp.$$typeof)) {
      ctx.missing.push(path);
      return h('div', { key: key, 'data-dc-missing': path, style: { outline: '2px dashed #c00', padding: 6, font: '12px ui-monospace, monospace', color: '#c00' } }, 'No component at ' + path);
    }
    // Every mounted component sits inside a plain element, as on the canvas. style places the slot.
    return h('div', { key: key, 'data-x-import': path, style: p.slot || { display: 'contents' } }, h(Comp, p.props));
  }
  function renderBoardImport(node, scope, ctx, key) {
    var name = node.getAttribute('name');
    var Board = ctx.boards[name];
    var p = importProps(node, scope, ['name', 'hint-size']);
    if (!Board) {
      ctx.missing.push(name + '.dc.html');
      return h('div', { key: key, 'data-dc-missing': name, style: { outline: '2px dashed #c00', padding: 6, color: '#c00' } }, 'No board ' + name);
    }
    p.props.key = key;
    return h(Board, p.props);
  }

  // --- Boards ----------------------------------------------------------------
  function componentFrom(doc, name, ctx) {
    var xdc = doc.querySelector('x-dc');
    if (!xdc) throw new Error(name + ': no <x-dc> element');
    var helmet = null;
    for (var i = 0; i < xdc.children.length; i++) if (xdc.children[i].localName === 'helmet') helmet = xdc.children[i];
    if (helmet) {
      for (var j = 0; j < helmet.children.length; j++) {
        var c = helmet.children[j];
        var sig = c.outerHTML;
        if (ctx.helmets.indexOf(sig) < 0) { ctx.helmets.push(sig); document.head.appendChild(c.cloneNode(true)); }
      }
    }
    var template = Array.prototype.filter.call(xdc.childNodes, function (n) { return n !== helmet; });
    var Base = function DCLogic(props) {
      React.Component.call(this, props);
      if (!this.state) this.state = {};
    };
    Base.prototype = Object.create(React.Component.prototype);
    Base.prototype.constructor = Base;
    Base.prototype.render = function () {
      var vals = typeof this.renderVals === 'function' ? (this.renderVals() || {}) : {};
      // The canvas resolves a hole against the board's props with renderVals() over them, so an imported board's
      // {{label}} reads the label it was given.
      return h(React.Fragment, null, renderNodes(template, Object.assign({}, this.props, vals), ctx));
    };
    var script = doc.querySelector('script[data-dc-script]');
    // A Design System preview is one root element and one script, so its logic arrives as a string.
    var code = script && script.textContent.trim() ? script.textContent : (doc === document && typeof window.__dcLogic === 'string' ? window.__dcLogic : '');
    var Logic = null;
    if (code) {
      // Classes need a real constructor to extend, so the base is wrapped as a class first.
      var Klass = new Function('Base', 'return class DCLogic extends Base {}')(Base);
      Logic = new Function('DCLogic', 'React', '"use strict";\n' + code + '\n;return typeof Component === "function" ? Component : null;')(Klass, React);
    }
    var C = Logic || Base;
    C.displayName = name;
    return C;
  }
  // XHR rather than fetch: fetch refuses file:// outright, and a local preview runs from files.
  function read(url) {
    return new Promise(function (resolve, reject) {
      var x = new XMLHttpRequest();
      x.open('GET', url);
      x.onload = function () { (x.status === 200 || (x.status === 0 && x.responseText)) ? resolve(x.responseText) : reject(new Error(url + ': ' + x.status)); };
      x.onerror = function () { reject(new Error(url + ': could not be read')); };
      x.send();
    });
  }
  function importsIn(doc) {
    return Array.prototype.map.call(doc.querySelectorAll('dc-import[name]'), function (n) { return n.getAttribute('name'); });
  }
  function load(name, ctx) {
    if (ctx.boards[name] || ctx.loading[name]) return ctx.loading[name] || Promise.resolve();
    // A rendered preview carries the boards it places, because a browser may refuse to read sibling files.
    var embedded = window.__dcBoards && window.__dcBoards[name];
    ctx.loading[name] = (typeof embedded === 'string' ? Promise.resolve(embedded) : read(name + '.dc.html'))
      .then(function (src) {
        var doc = new DOMParser().parseFromString(src, 'text/html');
        return Promise.all(importsIn(doc).map(function (n) { return load(n, ctx); })).then(function () {
          ctx.boards[name] = componentFrom(doc, name, ctx);
        });
      })
      .catch(function (e) { ctx.errors.push(String(e && e.message || e)); });
    return ctx.loading[name];
  }

  var Boundary = function (props) { React.Component.call(this, props); this.state = { error: null }; };
  Boundary.prototype = Object.create(React.Component.prototype);
  Boundary.getDerivedStateFromError = function (error) { return { error: error }; };
  Boundary.prototype.componentDidCatch = function (error) { root.setAttribute('data-dc-error', String(error && error.message || error)); };
  Boundary.prototype.render = function () {
    if (this.state.error) return h('pre', { 'data-dc-error': '', style: { color: '#c00', font: '13px ui-monospace, monospace', padding: 16, whiteSpace: 'pre-wrap' } }, 'This board failed to render: ' + (this.state.error.message || this.state.error));
    return this.props.children;
  };

  function boot() {
    var ctx = { boards: {}, loading: {}, helmets: [], missing: [], errors: [] };
    var xdc = document.querySelector('x-dc');
    if (!xdc) { root.setAttribute('data-dc-error', 'no <x-dc> element'); return; }
    var props = {};
    try {
      var q = new URLSearchParams(location.search).get('props');
      if (q) props = JSON.parse(q);
    } catch (e) { root.setAttribute('data-dc-error', '?props is not JSON'); }
    var Main;
    try { Main = componentFrom(document, 'Main', ctx); } catch (e) { root.setAttribute('data-dc-error', String(e.message || e)); return; }
    // Read the boards it imports before the template leaves the page.
    var names = importsIn(document);
    var mount = document.createElement('div');
    mount.setAttribute('data-dc-root', '');
    xdc.parentNode.replaceChild(mount, xdc);
    Promise.all(names.map(function (n) { return load(n, ctx); })).then(function () {
      ReactDOM.createRoot(mount).render(h(Boundary, null, h(Main, props)));
      // Timers, not animation frames: a headless capture runs on virtual time, where frames may never
      // come. React commits, then effects (a theme set on <html>) settle, before anyone looks.
      setTimeout(function () {
        setTimeout(function () {
          if (ctx.errors.length) root.setAttribute('data-dc-error', ctx.errors.join('; '));
          if (ctx.missing.length) root.setAttribute('data-dc-missing', ctx.missing.join(' '));
          var holes = Object.keys(unfilled);
          if (holes.length) root.setAttribute('data-dc-unfilled', holes.join(' '));
          root.setAttribute('data-dc-ready', '1');
        }, 30);
      }, 30);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
