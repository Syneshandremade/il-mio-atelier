/* ── Header mobile ── */
.mobile-header {
  display: none;
}

@media (max-width: 640px) {
  .mobile-header {
    display: block;
    position: sticky;
    top: 0;
    z-index: 40;
    background: var(--surface);
    backdropFilter: blur(12px);
    padding: 16px 20px;
    text-align: center;
    border-bottom: 1px solid var(--border);
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  .mobile-header.nascosto {
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
  }
}

/* ── Sub-tabs collezione ── */
.sub-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-s);
  padding-bottom: 0;
}

.sub-tab {
  padding: 8px 16px;
  border: none;
  background: none;
  color: var(--text-3);
  font-family: var(--ff-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.18s;
}

.sub-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
