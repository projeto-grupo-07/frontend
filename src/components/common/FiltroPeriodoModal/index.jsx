import React, { useState, useEffect } from "react";
import { Modal } from "../Modal"; // Ajuste o caminho conforme sua estrutura

export default function FiltroPeriodoModal({ show, onClose, filtroAtual, onApply }) {
    const [tipoSelecionado, setTipoSelecionado] = useState(filtroAtual?.tipo || "Mês");
    const [dataInicial, setDataInicial] = useState(filtroAtual?.inicio || "");
    const [dataFinal, setDataFinal] = useState(filtroAtual?.fim || "");

    // Sincroniza o estado interno se o modal for reaberto
    useEffect(() => {
        if (show && filtroAtual) {
            setTipoSelecionado(filtroAtual.tipo);
            if (filtroAtual.tipo === "Personalizado") {
                setDataInicial(filtroAtual.inicio || "");
                setDataFinal(filtroAtual.fim || "");
            } else {
                setDataInicial("");
                setDataFinal("");
            }
        }
    }, [show, filtroAtual]);

    const handleApply = () => {
        if (tipoSelecionado === "Personalizado") {
            if (!dataInicial || !dataFinal) {
                alert("Por favor, selecione a data inicial e final.");
                return;
            }
            if (new Date(dataInicial) > new Date(dataFinal)) {
                alert("A data inicial não pode ser maior que a data final.");
                return;
            }
            onApply({ tipo: "Personalizado", inicio: dataInicial, fim: dataFinal });
        } else {
            onApply({ tipo: tipoSelecionado, inicio: null, fim: null });
        }
        onClose();
    };

    if (!show) return null;

    const opcoesRapidas = ["Hoje", "Esta Semana", "Este Mês", "Este Semestre"];

    return (
        <Modal show={show} title="Filtrar Período" onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
                
                {/* Botões Rápidos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Períodos Rápidos</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {opcoesRapidas.map(opcao => (
                            <button
                                key={opcao}
                                type="button"
                                onClick={() => setTipoSelecionado(opcao)}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: tipoSelecionado === opcao ? '#ed64a6' : '#cbd5e0',
                                    backgroundColor: tipoSelecionado === opcao ? '#fff0f6' : '#f7fafc',
                                    color: tipoSelecionado === opcao ? '#d53f8c' : '#4a5568',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '14px'
                                }}
                            >
                                {opcao}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                    <span style={{ padding: '0 15px', color: '#a0aec0', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>OU</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                </div>

                {/* Filtro Personalizado */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                            type="radio" 
                            id="radio-custom" 
                            checked={tipoSelecionado === "Personalizado"}
                            onChange={() => setTipoSelecionado("Personalizado")}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                        <label htmlFor="radio-custom" style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0, cursor: 'pointer' }}>
                            Período Personalizado
                        </label>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px', opacity: tipoSelecionado === "Personalizado" ? 1 : 0.5, pointerEvents: tipoSelecionado === "Personalizado" ? 'auto' : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ color: '#718096', fontSize: '12px', fontWeight: 'bold' }}>Data Inicial</label>
                            <input 
                                type="date" 
                                value={dataInicial} 
                                onChange={e => setDataInicial(e.target.value)}
                                style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#fff', color: '#2d3748', fontSize: '14px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ color: '#718096', fontSize: '12px', fontWeight: 'bold' }}>Data Final</label>
                            <input 
                                type="date" 
                                value={dataFinal} 
                                onChange={e => setDataFinal(e.target.value)}
                                style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#fff', color: '#2d3748', fontSize: '14px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Rodapé */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                    <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#e2e8f0', color: '#4a5568', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                        Cancelar
                    </button>
                    <button type="button" onClick={handleApply} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#ed64a6', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                        Aplicar Filtro
                    </button>
                </div>
            </div>
        </Modal>
    );
}