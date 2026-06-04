import React, { useState, useEffect } from 'react';
import { SearchBar } from '../../components/common/SearchBar';
import Button from '../../components/common/Button'; 
import { CampanhaCard } from '../../components/common/CampanhaCard';
import CadastrarClienteModal from '../../components/common/CadastrarClienteModal';
import CadastrarCampanhaModal from '../../components/common/CadastrarCampanhaModal';
import EditarCampanhaModal from '../../components/common/EditarCampanhaModal';
import FilterCampanhaModal from '../../components/common/FilterCampanhaModal';
import { CampanhaService } from '../../services/CampanhaService';
import './styles.css';

export default function Campanha() {
    const [isCriarModalOpen, setIsCriarModalOpen] = useState(false);
    const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false);
    const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    
    const [campanhaEditandoId, setCampanhaEditandoId] = useState(null);
    const [campanhas, setCampanhas] = useState([]);
    const [filtros, setFiltros] = useState({ assunto: '', status: '' });
    const [isLoading, setIsLoading] = useState(false);

    // ESTADOS DE PAGINAÇÃO
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalElementos, setTotalElementos] = useState(0);
    const [verTodos, setVerTodos] = useState(false);
    const [tamanhoPagina, setTamanhoPagina] = useState(15);

    const carregarCampanhas = async (pagina = 0, isAll = verTodos, tamanhoAtual = tamanhoPagina) => {
        setIsLoading(true);
        try {
            let lista = [];

            if (isAll) {
                const response = await CampanhaService.listarCampanhas();
                lista = response.data || response || [];
                setPaginaAtual(0);
                setTotalPaginas(1);
                setTotalElementos(lista.length);
            } else {
                const response = await CampanhaService.getPaginated(pagina, tamanhoAtual);
                const dados = response.data || response;
                lista = dados?.conteudo || dados?.content || [];
                
                setPaginaAtual(dados?.pagina ?? dados?.number ?? pagina);
                setTotalPaginas(dados?.totalPaginas ?? dados?.totalPages ?? 1);
                setTotalElementos(dados?.totalElementos ?? dados?.totalElements ?? dados?.total ?? 0);
            }

            setCampanhas(lista);
        } catch (error) {
            console.error("Erro ao carregar campanhas:", error);
            setCampanhas([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        carregarCampanhas(0);
    }, []);

    useEffect(() => {
        document.title = "Campanhas | Brink Calçados";
    }, []);

    const irParaPagina = (pagina) => {
        if (pagina >= 0 && pagina < totalPaginas && pagina !== paginaAtual) {
            carregarCampanhas(pagina, verTodos, tamanhoPagina);
        }
    };

    const paginasVisiveis = () => {
        const paginas = [];
        const inicio = Math.max(0, paginaAtual - 2);
        const fim = Math.min(totalPaginas - 1, paginaAtual + 2);
        for (let i = inicio; i <= fim; i++) {
            paginas.push(i);
        }
        return paginas;
    };

    const handleToggleVerTodos = () => {
        const novoStatus = !verTodos;
        setVerTodos(novoStatus);
        
        if (novoStatus) setFiltros({ assunto: '', status: '' });
        carregarCampanhas(0, novoStatus, tamanhoPagina);
    };

    const handleAplicarTamanho = () => {
        let novoTamanho = Number(tamanhoPagina);
        if (novoTamanho < 1) {
            novoTamanho = 1;
            setTamanhoPagina(1);
        } else if (novoTamanho > 1000) {
            novoTamanho = 1000;
            setTamanhoPagina(1000);
        }
        carregarCampanhas(0, verTodos, novoTamanho);
    };

    const aplicarFiltros = async () => {
        setIsLoading(true);
        setVerTodos(false);
        try {
            const response = await CampanhaService.filtrar(filtros);
            if (response.status === 204) {
                setCampanhas([]);
                setTotalElementos(0);
                setTotalPaginas(1);
            } else {
                const listaFiltrada = response.data || response || [];
                setCampanhas(listaFiltrada);
                setTotalElementos(listaFiltrada.length);
                setTotalPaginas(1);
            }
        } catch (error) {
            console.error(error);
            setCampanhas([]);
        } finally {
            setIsLoading(false);
        }
    };

    const limparFiltros = () => {
        setFiltros({ assunto: '', status: '' });
        carregarCampanhas(0, verTodos, tamanhoPagina);
    };

    const handleSalvarCliente = (dadosCliente) => {
        setIsCadastroModalOpen(false);
    };

    const handleSalvarCampanha = async (dadosCampanha) => {
        const payload = {
            nome: dadosCampanha.nome,
            assunto: dadosCampanha.assunto,
            corpoTexto: dadosCampanha.corpoTexto,
            genero: dadosCampanha.genero !== "" ? dadosCampanha.genero : null,
            mesAniversario: dadosCampanha.mesAniversario !== "" ? parseInt(dadosCampanha.mesAniversario) : null,
            estado: dadosCampanha.estado !== "" ? dadosCampanha.estado : null,
            cidade: dadosCampanha.cidade !== "" ? dadosCampanha.cidade : null,
            bairro: dadosCampanha.bairro !== "" ? dadosCampanha.bairro : null
        };

        try {
            await CampanhaService.criarCampanha(payload);
            setIsCriarModalOpen(false);
            alert("Campanha criada com sucesso!");
            carregarCampanhas(paginaAtual);
        } catch (error) {
            alert("Erro: " + error.message);
        }
    };

    const handleAbrirEdicao = (id) => {
        setCampanhaEditandoId(id);
        setIsEditarModalOpen(true);
    };

    const handleIniciar = async (id) => {
        if (!window.confirm('Deseja realmente disparar os e-mails desta campanha agora?')) return;
        try {
            await CampanhaService.iniciarCampanha(id);
            alert("Campanha iniciada com sucesso!");
            carregarCampanhas(paginaAtual);
        } catch (error) {
            console.error(error);
            alert("Erro ao iniciar campanha.");
        }
    };

    const handleDeletar = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta campanha?')) return;
        try {
            await CampanhaService.deletarCampanha(id);
            carregarCampanhas(paginaAtual);
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir campanha.");
        }
    };

    // Variável derivada para saber se há filtros aplicados e exibir o botão de limpar
    const temFiltroAtivo = filtros.assunto !== '' || filtros.status !== '';

    return (
        <div className="page-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* CABEÇALHO CEGO */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ flexShrink: 0 }}>
                        <Button onClick={() => setIsCriarModalOpen(true)}>+ Criar Campanha</Button>
                    </div>

                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <SearchBar
                            placeholder="Pesquisar por assunto..."
                            value={filtros.assunto}
                            onChange={(e) => setFiltros(prev => ({ ...prev, assunto: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 }}>
                        
                        {/* Indicador visual se o usuário filtrou algo no modal que não aparece na barra */}
                        {filtros.status !== '' && (
                            <span style={{ fontSize: '0.85rem', color: '#ed64a6', fontWeight: 'bold' }}>
                                Filtro Ativo
                            </span>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4A4A4A', fontWeight: '500' }}>
                            <input 
                                type="checkbox" 
                                id="toggleVerTodasCampanhas" 
                                checked={verTodos}
                                onChange={handleToggleVerTodos}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="toggleVerTodasCampanhas" style={{ cursor: 'pointer', userSelect: 'none' }}>
                                Ver todas
                            </label>
                        </div>

                        <Button onClick={() => setIsFilterModalOpen(true)}>Filtros</Button>
                        
                        {/* O botão Limpar só aparece se algo foi digitado ou selecionado */}
                        {temFiltroAtivo && (
                            <Button onClick={limparFiltros} style={{ backgroundColor: '#94a3b8' }}>Limpar</Button>
                        )}
                    </div>
                </div>
            </div>

            {/* CONTAINER DOS CARDS E PAGINAÇÃO */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {isLoading ? (
                    <div className="empty-table-placeholder" style={{ padding: '40px', textAlign: 'center' }}>
                        Buscando campanhas...
                    </div>
                ) : (
                    <>
                        {campanhas.length > 0 ? (
                            <div className="campanha-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                                {campanhas.map((campanha) => (
                                    <CampanhaCard
                                        key={campanha.id}
                                        campanha={campanha}
                                        onIniciar={() => handleIniciar(campanha.id)}
                                        onDeletar={() => handleDeletar(campanha.id)}
                                        onEditar={() => handleAbrirEdicao(campanha.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-table-placeholder" style={{ padding: '40px', textAlign: 'center' }}>
                                Nenhuma campanha encontrada.
                            </div>
                        )}

                        {/* PAGINAÇÃO PADRONIZADA NO RODAPÉ */}
                        {!verTodos && totalPaginas > 0 && (
                            <div className="pagination-wrapper" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    className="btn-paginacao"
                                    disabled={paginaAtual === 0}
                                    onClick={() => irParaPagina(paginaAtual - 1)}
                                >
                                    Anterior
                                </button>

                                {paginaAtual > 2 && (
                                    <>
                                        <button className="btn-paginacao" onClick={() => irParaPagina(0)}>1</button>
                                        {paginaAtual > 3 && <span className="btn-paginacao-separator">...</span>}
                                    </>
                                )}

                                {paginasVisiveis().map(p => (
                                    <button
                                        key={p}
                                        className={`btn-paginacao ${p === paginaAtual ? 'btn-paginacao-ativo' : ''}`}
                                        onClick={() => irParaPagina(p)}
                                    >
                                        {p + 1}
                                    </button>
                                ))}

                                {paginaAtual < totalPaginas - 3 && (
                                    <>
                                        {paginaAtual < totalPaginas - 4 && <span className="btn-paginacao-separator">...</span>}
                                        <button className="btn-paginacao" onClick={() => irParaPagina(totalPaginas - 1)}>{totalPaginas}</button>
                                    </>
                                )}

                                <button
                                    className="btn-paginacao"
                                    disabled={paginaAtual === totalPaginas - 1}
                                    onClick={() => irParaPagina(paginaAtual + 1)}
                                >
                                    Próxima
                                </button>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#5D78A9' }}>
                                        <label htmlFor="itensPorPaginaCampanhas">Itens por página:</label>
                                        <input 
                                            type="number"
                                            id="itensPorPaginaCampanhas"
                                            min="1"
                                            value={tamanhoPagina} 
                                            onChange={(e) => setTamanhoPagina(e.target.value)}
                                            onBlur={handleAplicarTamanho}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAplicarTamanho()}
                                            style={{ 
                                                width: '60px', padding: '4px 8px', borderRadius: '6px', 
                                                border: '1px solid #C5D3F7', outline: 'none', 
                                                color: '#2D3E50', textAlign: 'center'
                                            }}
                                        />
                                    </div>

                                    <span className="btn-paginacao-info" style={{ color: '#5D78A9', fontWeight: '500' }}>
                                        {totalElementos} campanha{totalElementos !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <CadastrarClienteModal
                isOpen={isCadastroModalOpen}
                onClose={() => setIsCadastroModalOpen(false)}
                onSalvar={handleSalvarCliente}
            />

            <CadastrarCampanhaModal
                isOpen={isCriarModalOpen}
                onClose={() => setIsCriarModalOpen(false)}
                onSalvar={handleSalvarCampanha}
            />

            <EditarCampanhaModal
                isOpen={isEditarModalOpen}
                onClose={() => setIsEditarModalOpen(false)}
                campanhaId={campanhaEditandoId}
                onAtualizada={() => carregarCampanhas(paginaAtual)}
            />

            <FilterCampanhaModal
                show={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onClear={limparFiltros}
                filtros={filtros}
                setFiltros={setFiltros}
                aplicarFiltros={aplicarFiltros}
            />
        </div>
    );
}