import { Modal } from "../Modal";

export default function FilterModal({
    show, onClose, onClear,
    categorias, marcas,
    filtrosCategorias, setFiltrosCategorias,
    filtrosSubcategorias, setFiltrosSubcategorias,
    filtrosMarcas, setFiltrosMarcas,
    filtroModelo, setFiltroModelo,
    filtroNome, setFiltroNome,
    precoMin, setPrecoMin,
    precoMax, setPrecoMax,
    aplicarFiltros
}) {

    // Junta as subcategorias de TODAS as categorias pai que estiverem marcadas
    const subcategoriasDinamicas = categorias
        .filter(c => filtrosCategorias.includes(c.descricao))
        .flatMap(c => c.subcategorias || []);

    const handleToggle = (valor, state, setState) => {
        setState(prev => 
            prev.includes(valor) ? prev.filter(item => item !== valor) : [...prev, valor]
        );
    };

    if (!show) return null;

    return (
        <div className="filter-modal">
            <Modal show={show} title="Filtrar Produtos" onClose={onClose}>
                <form onSubmit={aplicarFiltros} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
                    
                    {/* CHECKBOXES DE CATEGORIA PAI */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Categorias Principais</label>
                        <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid #cbd5e0', borderRadius: '8px', padding: '12px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {categorias.map(c => (
                                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input 
                                        type="checkbox" id={`cat-${c.id}`}
                                        checked={filtrosCategorias.includes(c.descricao)}
                                        onChange={() => handleToggle(c.descricao, filtrosCategorias, setFiltrosCategorias)}
                                        style={{ margin: 0, width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                                    />
                                    <label htmlFor={`cat-${c.id}`} style={{ margin: 0, cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#2d3748' }}>{c.descricao}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CHECKBOXES DE SUBCATEGORIA (Só aparece se tiver alguma pai marcada) */}
                    {subcategoriasDinamicas.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Subcategorias</label>
                            <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid #cbd5e0', borderRadius: '8px', padding: '12px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {subcategoriasDinamicas.map(s => (
                                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input 
                                            type="checkbox" id={`sub-${s.id}`}
                                            checked={filtrosSubcategorias.includes(String(s.id))}
                                            onChange={() => handleToggle(String(s.id), filtrosSubcategorias, setFiltrosSubcategorias)}
                                            style={{ margin: 0, width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                                        />
                                        <label htmlFor={`sub-${s.id}`} style={{ margin: 0, cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#2d3748' }}>{s.descricao}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CHECKBOXES DE MARCAS */}
                    {marcas && marcas.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Marcas</label>
                            <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid #cbd5e0', borderRadius: '8px', padding: '12px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {marcas.map(m => (
                                    <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input 
                                            type="checkbox" id={`marca-${m}`}
                                            checked={filtrosMarcas.includes(m)}
                                            onChange={() => handleToggle(m, filtrosMarcas, setFiltrosMarcas)}
                                            style={{ margin: 0, width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                                        />
                                        <label htmlFor={`marca-${m}`} style={{ margin: 0, cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#2d3748' }}>{m}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CAMPOS DE TEXTO E PREÇO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Nome / Modelo</label>
                        <input 
                            value={filtroNome} 
                            placeholder="Ex: Revolution" 
                            onChange={e => setFiltroNome(e.target.value)} 
                            style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Preço mínimo (R$)</label>
                            <input 
                                type="number" step="0.01" min="0" value={precoMin} onChange={e => setPrecoMin(e.target.value)} placeholder="0.00"
                                style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Preço máximo (R$)</label>
                            <input 
                                type="number" step="0.01" min="0" value={precoMax} onChange={e => setPrecoMax(e.target.value)} placeholder="0.00"
                                style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    {/* BOTÕES DO RODAPÉ */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#e2e8f0', color: '#4a5568', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
                        <button type="button" onClick={onClear} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#edf2f7', color: '#e53e3e', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Limpar Filtros</button>
                        <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#ed64a6', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Aplicar Filtros</button>
                    </div>
                    
                </form>
            </Modal>
        </div>
    );
}