/* ============================================
   DESCUENTOS ADMIN
   ============================================ */

.descuentos-admin {
  max-width: 1400px;
}

.descuentos-admin .section-header {
  margin-bottom: 1.5rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-top h2 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--ink);
  font-weight: 600;
}

.btn-agregar {
  background: var(--blue);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-agregar:hover {
  background: var(--blue-600);
  box-shadow: var(--shadow);
}

.btn-reintentar {
  background: var(--blue);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--slate-200);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.stat-icon {
  font-size: 1.8rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--blue-50);
  border-radius: var(--radius);
  flex-shrink: 0;
}

.stat-vigentes .stat-icon { background: var(--good-tint); }
.stat-programados .stat-icon { background: var(--blue-50); }
.stat-expirados .stat-icon { background: var(--alert-tint); }

.stat-valor {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 0.78rem;
  color: var(--slate-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

/* Toolbar */
.toolbar {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--slate-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.toolbar-filtros {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  flex: 1;
}

.toolbar-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.search-box {
  position: relative;
  min-width: 220px;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  color: var(--slate-500);
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1.5px solid var(--slate-200);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-family: var(--font-body);
  transition: all 0.2s;
  background: var(--surface);
}

.search-input:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px var(--blue-50);
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1.5px solid var(--slate-200);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  background: var(--surface);
  cursor: pointer;
  color: var(--slate-700);
  min-width: 160px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--blue);
}

/* Vista Toggle */
.vista-toggle {
  display: flex;
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.vista-btn {
  padding: 0.5rem 0.75rem;
  border: none;
  background: var(--surface);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  color: var(--slate-500);
}

.vista-btn.active {
  background: var(--blue);
  color: white;
}

.vista-btn:hover:not(.active) {
  background: var(--slate-100);
}

.resultados-info {
  color: var(--slate-500);
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  padding: 0 0.25rem;
}

/* Loading & Error */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  color: var(--slate-500);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--slate-200);
  border-top: 3px solid var(--blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 3rem;
}

.error-message {
  background: var(--alert-tint);
  color: #8a1130;
  padding: 1rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
  border: 1px solid #f6c9d3;
  font-weight: 500;
}

/* ============ TABLA ============ */
.table-container {
  background: var(--surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--slate-200);
  overflow-x: auto;
}

.descuentos-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.descuentos-table thead {
  background: var(--slate-100);
  border-bottom: 2px solid var(--slate-200);
}

.descuentos-table th {
  padding: 0.875rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--slate-700);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.descuentos-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}

.descuentos-table th.sortable:hover {
  color: var(--blue);
}

.descuentos-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--slate-100);
  vertical-align: middle;
}

.descuentos-table tbody tr {
  transition: background 0.15s;
}

.descuentos-table tbody tr:hover {
  background: var(--blue-50);
}

.descuento-row.estado-expirado,
.descuento-row.estado-inactivo {
  opacity: 0.65;
}

/* Badges */
.estado-badge-descuento {
  display: inline-block;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.alcance-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--slate-100);
  color: var(--slate-700);
  white-space: nowrap;
}

.aplica-cell {
  color: var(--ink);
  font-weight: 500;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tipo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.85rem;
}

.tipo-badge.porcentaje {
  background: var(--blue-50);
  color: var(--blue);
}

.tipo-badge.monto {
  background: var(--good-tint);
  color: var(--good);
}

.valor-cell {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.fecha-cell {
  white-space: nowrap;
  color: var(--slate-500);
  font-size: 0.85rem;
}

/* Acciones */
.acciones-cell {
  display: flex;
  gap: 0.35rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--slate-200);
  background: var(--surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--slate-100);
  border-color: var(--slate-300);
  transform: scale(1.05);
}

.btn-icon.btn-danger:hover {
  background: var(--alert-tint);
  border-color: var(--alert);
}

/* ============ EMPTY STATE ============ */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--slate-500);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.75rem;
}

.empty-state p {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.empty-hint {
  font-size: 0.85rem;
  color: var(--slate-300);
}

/* ============ VISTA CARDS ============ */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.descuento-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--slate-200);
  transition: transform 0.2s, box-shadow 0.2s;
}

.descuento-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.descuento-card.estado-expirado,
.descuento-card.estado-inactivo {
  opacity: 0.65;
}

.descuento-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--slate-100);
}

.tipo-badge-card {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: var(--slate-100);
  color: var(--slate-700);
}

.card-body {
  padding: 1rem;
}

.descuento-info {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-bottom: 0.9rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.info-row span {
  color: var(--slate-500);
}

.info-row strong {
  color: var(--ink);
  text-align: right;
}

.valor-row strong {
  font-family: var(--font-display);
}

.valor-descuento {
  color: var(--blue) !important;
  font-size: 1.05rem;
}

.fechas-info {
  display: flex;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--slate-100);
}

.fecha-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.fecha-item span {
  font-size: 0.72rem;
  color: var(--slate-500);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.fecha-item strong {
  font-size: 0.82rem;
  color: var(--ink);
}

.card-acciones {
  display: flex;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--slate-100);
  background: var(--paper);
}

.card-acciones button {
  flex: 1;
  border: 1.5px solid var(--slate-200);
  background: var(--surface);
  padding: 0.55rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--slate-700);
}

.card-acciones button:hover {
  border-color: var(--blue);
  color: var(--blue);
}

.btn-eliminar-card:hover {
  border-color: var(--alert) !important;
  color: var(--alert) !important;
}

/* ============ PAGINACIÓN ============ */
.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.35rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.btn-pagina {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-sm);
  background: var(--surface);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--slate-700);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-pagina:hover:not(:disabled):not(.active) {
  background: var(--slate-100);
  border-color: var(--slate-300);
}

.btn-pagina.active {
  background: var(--blue);
  color: white;
  border-color: var(--blue);
}

.btn-pagina:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.paginacion-dots {
  padding: 0 0.25rem;
  color: var(--slate-300);
}

/* ============ MODAL CONFIRMACIÓN ============ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(16, 16, 38, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeInOverlay 0.2s ease;
  backdrop-filter: blur(2px);
}

@keyframes fadeInOverlay {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-confirmacion {
  background: var(--surface);
  border-radius: var(--radius-lg);
  max-width: 420px;
  width: 100%;
  padding: 1.75rem;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.modal-confirmacion h3 {
  font-family: var(--font-display);
  font-size: 1.15rem;
  margin-bottom: 0.75rem;
  color: var(--ink);
}

.modal-confirmacion p {
  color: var(--slate-700);
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
}

.warning-text {
  color: var(--alert);
  font-size: 0.82rem;
}

.modal-acciones {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.btn-cancelar {
  flex: 1;
  padding: 0.65rem;
  border: 1.5px solid var(--slate-200);
  background: var(--surface);
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  color: var(--slate-700);
}

.btn-eliminar {
  flex: 1;
  padding: 0.65rem;
  border: none;
  background: var(--alert);
  color: white;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
}

.btn-eliminar:hover {
  background: #b91d3f;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 1024px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar-filtros {
    flex-direction: column;
  }
  .search-box {
    min-width: 100%;
  }
}

@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    align-items: flex-start;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .filter-select {
    min-width: 100%;
  }
  .cards-grid {
    grid-template-columns: 1fr;
  }
  .paginacion {
    gap: 0.2rem;
  }
  .btn-pagina {
    min-width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  /* --- Tabla → tarjetas: soluciona el desborde horizontal en móvil --- */
  .table-container {
    overflow-x: visible;
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .descuentos-table thead {
    display: none;
  }

  .descuentos-table,
  .descuentos-table tbody,
  .descuentos-table tr {
    display: block;
    width: 100%;
  }

  .descuentos-table tr {
    background: var(--surface);
    border: 1px solid var(--slate-200);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    margin-bottom: 0.75rem;
    overflow: hidden;
  }

  .descuentos-table td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--slate-100);
    text-align: right;
  }

  .descuentos-table tr td:last-child {
    border-bottom: none;
  }

  /* Etiqueta de campo generada desde el atributo data-label del <td> */
  .descuentos-table td[data-label]::before {
    content: attr(data-label);
    font-weight: 600;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--slate-500);
    text-align: left;
    flex-shrink: 0;
  }

  /* Celda de acciones: fila de botones a todo el ancho, más grandes para el dedo */
  .td-acciones {
    padding: 0.75rem !important;
  }

  .td-acciones .acciones-cell {
    justify-content: stretch;
    width: 100%;
  }

  .td-acciones .btn-icon {
    flex: 1;
    width: auto;
    height: 40px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  .btn-pagina {
    min-width: 28px;
    height: 28px;
  }
}
