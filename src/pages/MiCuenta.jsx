.mi-cuenta,
.mi-cuenta *,
.mi-cuenta *::before,
.mi-cuenta *::after {
  box-sizing: border-box;
}

.mi-cuenta {
  --color-brand: #0052DC;
  --color-brand-dark: #1A1A3A;
  --color-brand-light: #eaf0ff;
  --color-accent: #12A594;
  --color-accent-light: #e7f8f5;
  --color-positive: #15803d;
  --color-negative: #dc2626;
  --color-warning: #d97706;
  --color-bg: #FBFAF7;
  --color-surface: #ffffff;
  --color-border: #e7e6e0;
  --color-text: #1A1A3A;
  --color-text-muted: #6b6b7a;

  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 96px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--color-text);
  background: var(--color-bg);
  font-variant-numeric: tabular-nums;
  overflow-x: hidden;
}

.mi-cuenta h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.01em;
}

.mi-cuenta h2 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.mi-cuenta h3 {
  font-size: 0.92rem;
  font-weight: 700;
  margin: 0 0 10px;
}

/* --- Encabezado --- */
.mi-cuenta__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.mi-cuenta__header-info {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.mi-cuenta__avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-brand), var(--color-brand-dark));
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  flex-shrink: 0;
}

.mi-cuenta__header-info > div {
  min-width: 0;
}

.mi-cuenta__email {
  margin: 2px 0 0;
  color: var(--color-text-muted);
  font-size: 0.88rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mi-cuenta__header-acciones {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.mi-cuenta__icono-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  cursor: pointer;
  text-decoration: none;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.mi-cuenta__icono-btn:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.mi-cuenta__alerta {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fef2f2;
  color: var(--color-negative);
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

/* ================================================================== */
/* Modal de confirmación (cerrar sesión)                                */
/* ================================================================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 58, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-confirmar {
  position: relative;
  background: var(--color-surface);
  border-radius: 18px;
  padding: 24px 22px 20px;
  width: 100%;
  max-width: 340px;
  text-align: center;
}

.modal-confirmar__cerrar {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: var(--color-bg);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.modal-confirmar h3 {
  margin: 6px 0 8px;
  font-size: 1.05rem;
  font-weight: 700;
}

.modal-confirmar p {
  margin: 0 0 20px;
  font-size: 0.87rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.modal-confirmar__acciones {
  display: flex;
  gap: 10px;
}

.modal-confirmar__acciones .btn {
  flex: 1;
  justify-content: center;
}

.btn--secundario {
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn--peligro {
  background: var(--color-negative);
  color: #ffffff;
}

.btn--peligro:hover {
  background: #b91c1c;
}

/* ================================================================== */
/* Pills de acceso rápido — carrusel horizontal                        */
/* ================================================================== */
.accesos-rapidos {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 22px;
  padding-bottom: 2px;
}

.accesos-rapidos::-webkit-scrollbar {
  display: none;
}

.accesos-rapidos__item {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 999px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.83rem;
  font-weight: 600;
  white-space: nowrap;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.accesos-rapidos__item:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}

/* ================================================================== */
/* Resumen financiero — carrusel de mini estadísticas                  */
/* ================================================================== */
.resumen-financiero {
  margin-bottom: 22px;
}

.resumen-financiero__titulo {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 12px;
}

.resumen-financiero__carrusel {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
}

.resumen-financiero__carrusel::-webkit-scrollbar {
  display: none;
}

.stat-card {
  flex: 0 0 auto;
  min-width: 148px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-decoration: none;
  color: var(--color-text);
}

.stat-card__label {
  font-size: 0.76rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.stat-card__valor {
  font-size: 1.2rem;
  font-weight: 700;
}

.stat-card__valor--rojo {
  color: var(--color-negative);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  border: 1px solid transparent;
  text-decoration: none;
  cursor: pointer;
}

.btn--primario {
  background: var(--color-brand);
  color: #ffffff;
}

.btn--primario:hover {
  background: var(--color-brand-dark);
}

/* ================================================================== */
/* Sección "Tus pedidos" — título + flecha (estilo Amazon)              */
/* ================================================================== */
.seccion-pedidos {
  margin-bottom: 22px;
}

.seccion-pedidos__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.seccion-pedidos__flecha {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.seccion-pedidos__flecha:hover {
  color: var(--color-brand);
}

.bloque-preview__vacio {
  text-align: center;
  padding: 20px 10px 8px;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}

.bloque-preview__vacio p {
  margin: 0 0 12px;
}

/* --- Carrusel de MiniOrdenCard: sin bordes ni fondo propio, mismo      */
/* espaciado que el título de arriba --- */
.mini-ordenes-carrusel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
}

.mini-ordenes-carrusel::-webkit-scrollbar {
  display: none;
}

.mini-orden-card {
  flex: 0 0 auto;
  width: 240px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 14px 16px;
  text-decoration: none;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.mini-orden-card:hover {
  box-shadow: 0 8px 20px rgba(26, 26, 58, 0.08);
  transform: translateY(-2px);
}

.mini-orden-card__top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mini-orden-card__icono {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-brand-light);
  color: var(--color-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mini-orden-card__info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.mini-orden-card__titulo {
  font-weight: 700;
  font-size: 0.88rem;
}

.mini-orden-card__meta {
  font-size: 0.74rem;
  color: var(--color-text-muted);
}

.mini-orden-card__badge {
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  padding: 4px 9px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}

.mini-orden-card__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0eb;
}

.mini-orden-card__texto {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.mini-orden-card__resena {
  font-size: 0.74rem;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-orden-card__monto {
  font-size: 0.92rem;
  font-weight: 700;
}

.mini-orden-card__flecha {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-brand-dark);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ================================================================== */
/* Hub de categorías (patrón desktop de Amazon: grid de tarjetas       */
/* con icono, título y descripción — "Tu cuenta"). Oculto en móvil:     */
/* en móvil se usan las pills de acceso rápido en su lugar.             */
/* ================================================================== */
.hub-cuenta--desktop {
  display: none;
}

.hub-cuenta {
  margin: 18px 0 24px;
}

.hub-cuenta__titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: var(--color-text);
}

.hub-cuenta__titulo svg {
  color: var(--color-brand);
}

.hub-cuenta__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.hub-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 16px;
  text-decoration: none;
  color: var(--color-text);
  transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
  min-width: 0;
}

.hub-card:hover {
  box-shadow: 0 8px 22px rgba(26, 26, 58, 0.08);
  transform: translateY(-2px);
  border-color: #c9d8ff;
}

.hub-card__icono {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-brand-light);
  color: var(--color-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hub-card__texto {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.hub-card__titulo {
  font-weight: 700;
  font-size: 0.95rem;
}

.hub-card__descripcion {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  line-height: 1.3;
}

/* ================================================================== */
/* Columnas de links de texto (patrón desktop de Amazon: bloques de    */
/* "Preferencias de pedidos" / "Contenido digital" / etc.). Oculto en   */
/* móvil por ahora.                                                     */
/* ================================================================== */
.columnas-links--desktop {
  display: none;
}

.columnas-links {
  display: grid;
  grid-template-columns: 1fr;
  gap: 22px;
  padding: 20px 0 4px;
  border-top: 1px solid var(--color-border);
}

.columna-links ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.columna-links a {
  color: var(--color-brand);
  text-decoration: none;
  font-size: 0.87rem;
}

.columna-links a:hover {
  text-decoration: underline;
}

/* ================================================================== */
/* ¿Necesitas ayuda? — cierre de la página                              */
/* ================================================================== */
.ayuda-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 16px 18px;
  margin-top: 22px;
  text-decoration: none;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 600;
  transition: border-color 0.15s ease;
}

.ayuda-footer:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.mi-cuenta__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 26px;
  color: var(--color-text-muted);
  font-size: 0.76rem;
}

/* --- Carga --- */
.mi-cuenta__cargando {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 100px 20px;
  color: var(--color-text-muted);
}

.mi-cuenta__spinner {
  animation: girar 0.8s linear infinite;
  color: var(--color-brand);
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

/* --- Responsive: móvil --- */
@media (max-width: 560px) {
  .mi-cuenta {
    padding: 20px 16px 96px;
  }
}

/* ================================================================== */
/* Responsive: escritorio (≥1024px, mismo breakpoint arquitectónico    */
/* del proyecto donde desaparece el BottomNav)                         */
/* ================================================================== */
@media (min-width: 1024px) {
  .mi-cuenta {
    padding: 36px 40px 60px;
  }

  /* El hub de categorías y las columnas de links solo se muestran en    */
  /* escritorio; en móvil su función la cumplen las pills de arriba.     */
  .hub-cuenta--desktop {
    display: block;
  }

  .columnas-links--desktop {
    display: grid;
  }

  /* El hub de categorías pasa a grid de 3 columnas, como el desktop de Amazon */
  .hub-cuenta__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .hub-card {
    align-items: flex-start;
    padding: 20px;
  }

  /* Las columnas de links pasan de apiladas a 4 columnas lado a lado */
  .columnas-links {
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;
  }
}

@media (min-width: 1280px) {
  .hub-cuenta__grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
