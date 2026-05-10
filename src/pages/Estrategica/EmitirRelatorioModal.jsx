import React from 'react';
import './styles.css';

const MESES = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

export default function EmitirRelatorioModal({
  isOpen,
  mes,
  ano,
  onChangeMes,
  onChangeAno,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="estr-modal-overlay" onClick={onClose}>
      <div className="estr-modal-content estr-report-modal" onClick={(event) => event.stopPropagation()}>
        <div className="estr-report-modal-header">
          <div>
            <p className="estr-report-modal-kicker">Relatório estratégico</p>
            <h3 className="estr-report-modal-title">Escolha o período</h3>
          </div>
          <button className="estr-report-modal-close" type="button" onClick={onClose} aria-label="Fechar modal">
            ×
          </button>
        </div>

        <p className="estr-report-modal-description">
          Selecione o mês e o ano para preparar o relatório que será emitido depois pela integração do sistema.
        </p>

        <form onSubmit={onSubmit} className="estr-report-modal-form">
          <div className="estr-report-modal-grid">
            <div className="estr-report-field">
              <label htmlFor="mes-relatorio">Mês</label>
              <select
                id="mes-relatorio"
                value={mes}
                onChange={(event) => onChangeMes(event.target.value)}
              >
                {MESES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="estr-report-field">
              <label htmlFor="ano-relatorio">Ano</label>
              <input
                id="ano-relatorio"
                type="number"
                min="2000"
                max="2100"
                step="1"
                value={ano}
                onChange={(event) => onChangeAno(event.target.value)}
                placeholder="2026"
              />
            </div>
          </div>

          <div className="estr-report-modal-actions">
            <button type="button" className="estr-btn-secundario" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="estr-btn-relatorio" disabled={isSubmitting}>
              {isSubmitting ? 'Emitindo...' : 'Emitir relatório'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
