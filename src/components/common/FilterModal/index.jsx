import { Modal } from "../Modal";
import Button from "../Button";

export default function FilterModal({
    show, onClose,
    categorias, subcategorias,
    filtroCategoria, setFiltroCategoria,
    filtroSubcategoria, setFiltroSubcategoria,
    filtroMarca, setFiltroMarca,
    filtroModelo, setFiltroModelo,
    filtroNome, setFiltroNome,
    precoMin, setPrecoMin,
    precoMax, setPrecoMax,
    aplicarFiltros
}) {
    return (
        <Modal show={show} title="Filtrar Produtos" onClose={onClose}>
            <form onSubmit={aplicarFiltros}>
                <div className="form-group">
                    <label>Categoria Principal</label>
                    <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
                        <option value="">Todas</option>
                        {categorias.map(c => <option key={c.id} value={c.descricao}>{c.descricao}</option>)}
                    </select>
                </div>

                {subcategorias.length > 0 && (
                    <div className="form-group">
                        <label>Subcategoria</label>
                        <select value={filtroSubcategoria} onChange={e => setFiltroSubcategoria(e.target.value)}>
                            <option value="">Todas</option>
                            {subcategorias.map(s => <option key={s.id} value={s.id}>{s.descricao}</option>)}
                        </select>
                    </div>
                )}

                {filtroCategoria?.toLowerCase() === "calçados" ? (
                    <>
                        <div className="form-group">
                            <label>Marca</label>
                            <input value={filtroMarca} onChange={e => setFiltroMarca(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Modelo</label>
                            <input value={filtroModelo} onChange={e => setFiltroModelo(e.target.value)} />
                        </div>
                    </>
                ) : (
                    <div className="form-group">
                        <label>Nome</label>
                        <input value={filtroNome} onChange={e => setFiltroNome(e.target.value)} />
                    </div>
                )}

                <div className="form-group">
                    <label>Preço mínimo</label>
                    <input type="number" value={precoMin} onChange={e => setPrecoMin(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Preço máximo</label>
                    <input type="number" value={precoMax} onChange={e => setPrecoMax(e.target.value)} />
                </div>

                <div className="modal-actions">
                    <Button type="submit">Aplicar</Button>
                    <Button type="button" onClick={onClose}>Cancelar</Button>
                </div>
            </form>
        </Modal>
    );
}
