import { Modal } from "../Modal";

export default function FilterVendaModal({
    show, onClose, onClear,
    vendedores, formasPagamento,
    filtroDataInicio, setFiltroDataInicio,
    filtroDataFim, setFiltroDataFim,
    filtrosVendedores, setFiltrosVendedores,
    filtrosFormasPagamento, setFiltrosFormasPagamento,
    valorMin, setValorMin,
    valorMax, setValorMax,
    aplicarFiltros
}) {
    const formatarPagamento = (nome) => {
        const mapa = { 'DEBITO': 'Cartão de Débito', 'CREDITO': 'Cartão de Crédito', 'PIX': 'PIX', 'DINHEIRO': 'Dinheiro' };
        return mapa[nome] || nome;
    };

    const handleToggleVendedor = (idVendedor) => {
        setFiltrosVendedores(prev => 
            prev.includes(idVendedor) 
                ? prev.filter(id => id !== idVendedor)
                : [...prev, idVendedor]
        );
    };

    const handleTogglePagamento = (forma) => {
        setFiltrosFormasPagamento(prev => 
            prev.includes(forma) 
                ? prev.filter(f => f !== forma) 
                : [...prev, forma]
        );
    };

    return (
        <div className="filter-modal">
            <Modal show={show} title="Filtrar Vendas" onClose={onClose}>
                {/* O form agora tem display flex forçado para controlar os filhos */}
                <form onSubmit={aplicarFiltros} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px' }}>
                    
                    {/* Linha 1: Datas */}
                    <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#4a5568', margin: 0 }}>Data Inicial</label>
                            <input type="date" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} 
                                style={{ padding: '8px', border: '1px solid #cbd5e0', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#4a5568', margin: 0 }}>Data Final</label>
                            <input type="date" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} 
                                style={{ padding: '8px', border: '1px solid #cbd5e0', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    {/* Vendedores */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#4a5568', margin: 0 }}>Vendedores</label>
                        <div style={{ maxHeight: '130px', overflowY: 'auto', border: '1px solid #cbd5e0', borderRadius: '6px', padding: '12px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {vendedores.map(v => (
                                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input 
                                        type="checkbox" 
                                        id={`vend-${v.id}`}
                                        checked={filtrosVendedores.includes(v.id)}
                                        onChange={() => handleToggleVendedor(v.id)}
                                        style={{ margin: 0, width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                                    />
                                    <label htmlFor={`vend-${v.id}`} style={{ margin: 0, cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#2d3748' }}>
                                        {v.nome}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Formas de Pagamento */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#4a5568', margin: 0 }}>Formas de Pagamento</label>
                        <div style={{ maxHeight: '130px', overflowY: 'auto', border: '1px solid #cbd5e0', borderRadius: '6px', padding: '12px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {formasPagamento.map(f => (
                                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input 
                                        type="checkbox" 
                                        id={`pag-${f}`}
                                        checked={filtrosFormasPagamento.includes(f)}
                                        onChange={() => handleTogglePagamento(f)}
                                        style={{ margin: 0, width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                                    />
                                    <label htmlFor={`pag-${f}`} style={{ margin: 0, cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#2d3748' }}>
                                        {formatarPagamento(f)}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Linha 2: Valores */}
                    <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#4a5568', margin: 0 }}>Valor Mínimo (R$)</label>
                            <input type="number" step="0.01" value={valorMin} onChange={e => setValorMin(e.target.value)} 
                                style={{ padding: '8px', border: '1px solid #cbd5e0', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#4a5568', margin: 0 }}>Valor Máximo (R$)</label>
                            <input type="number" step="0.01" value={valorMax} onChange={e => setValorMax(e.target.value)} 
                                style={{ padding: '8px', border: '1px solid #cbd5e0', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    {/* Botões - Forçando display flex horizontal para não empilharem */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                        
                        <button type="button" onClick={onClose} 
                            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#e2e8f0', color: '#4a5568', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                            Cancelar
                        </button>
                        
                        <button type="button" onClick={onClear} 
                            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#edf2f7', color: '#e53e3e', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                            Limpar Filtros
                        </button>
                        
                        <button type="submit" 
                            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ed64a6', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                            Aplicar Filtros
                        </button>
                        
                    </div>
                </form>
            </Modal>
        </div>
    );
}