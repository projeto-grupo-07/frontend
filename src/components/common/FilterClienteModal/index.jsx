import React from 'react';

export default function FilterClienteModal({
    show,
    onClose,
    onClear,
    filtros,
    setFiltros,
    aplicarFiltros
}) {
    if (!show) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const handleApply = (e) => {
        e.preventDefault();
        aplicarFiltros();
        onClose(); // Fecha o modal após aplicar
    };

    const handleClear = () => {
        onClear();
        onClose(); // Fecha o modal após limpar
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2>Filtrar Clientes</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px 0' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#64748b' }}>Nome</label>
                        <input
                            type="text"
                            name="nome"
                            value={filtros.nome}
                            onChange={handleChange}
                            placeholder="Digite parte do nome..."
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#64748b' }}>Gênero</label>
                        <select
                            name="genero"
                            value={filtros.genero}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none', backgroundColor: '#fff' }}
                        >
                            <option value="">Todos</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="O">Outro</option>
                        </select>
                    </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px' }}>
                    <button onClick={handleClear} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#94a3b8', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                        Limpar
                    </button>
                    <button onClick={handleApply} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#ed64a6', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
}