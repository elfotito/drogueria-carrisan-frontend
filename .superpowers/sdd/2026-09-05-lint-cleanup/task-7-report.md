# Task 7 Report — Utils PDF (`src/utils/`)

## Changes per file (Receta R5 — `no-useless-assignment` / `no-unused-vars`)

The pattern in all three files: `let y = ...` followed by chained assignments
`y = dibujarX(doc, ..., y)`, where the LAST assignment (inside the final
conditional block) was never read afterward. Fix: convert that last dead
assignment into a plain call. The earlier `y = ...` assignments that feed the
next call are preserved.

### `src/utils/generarComprobantePagoPDF.js` (line 58)

```js
// antes
if (pago.pago_facturas?.length > 0) {
  y = dibujarFacturasAplicadas(doc, pago.pago_facturas, y)
}
// despues
if (pago.pago_facturas?.length > 0) {
  dibujarFacturasAplicadas(doc, pago.pago_facturas, y)
}
```

`y` is still read at the call's argument (line 58) and is not read anywhere
after within `generarComprobantePagoPDF`. All other `y` occurrences are in
separate helper functions with their own local `y`.

### `src/utils/generarFacturaPDF.js` (line 76)

```js
// antes
if (factura.nota) {
  y = dibujarNota(doc, factura.nota, y)
}
// despues
if (factura.nota) {
  dibujarNota(doc, factura.nota, y)
}
```

`y` is still read at the call's argument (line 76) and not read after within
`generarFacturaPDF`. Other `y` occurrences belong to helper functions.

### `src/utils/generarReporteEstadoCuentaPDF.js` (line 79)

```js
// antes
if (ordenes.length > 0) {
  y = dibujarOrdenesPendientes(doc, ordenes, y)
}
// despues
if (ordenes.length > 0) {
  dibujarOrdenesPendientes(doc, ordenes, y)
}
```

`y` is still read at the call's argument (line 79) and not read after within
`generarReporteEstadoCuentaPDF`. Other `y` occurrences belong to helper
functions.

## Verification command and output

Command:

```
npx eslint src/utils/generarComprobantePagoPDF.js src/utils/generarFacturaPDF.js src/utils/generarReporteEstadoCuentaPDF.js
```

Output:

```
(no output — exit code 0)
```

Result: **0 problems** (0 errors, 0 warnings).

## Concerns

- None. In each file, the `y` used at the (now plain) last call is the last
  read of that variable in the export function; no read occurs after it. All
  remaining `y` references in each file are inside helper functions with their
  own local variables. No behavior change: the return value of the last drawing
  function was unused before and remains unused.