import './styles.css';
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContainer } from '../../components/specific/TableContainer';
import Button from '../../components/common/Button';
import { IconButton } from '../../components/common/IconButton';
import { SearchBar } from '../../components/common/SearchBar';
import { DataTable } from '../../components/common/DataTable';
import { VendaService } from '../../services/VendaService';
import { FuncionarioService } from '../../services/FuncionarioService';
import DetalhesVendaModal from '../../components/common/DetalhesVendaModal';
import EditarVendaModal from '../../components/common/EditarVendaModal';

function Vendas() {
    const navigate = useNavigate();
    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState("");
    
    // Estados para Controle dos Modais
    const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [vendaSelecionada, setVendaSelecionada] = useState(null);

    const colunas = [
        { header: "Vendedor", accessor: "nomeVendedor" },
        { header: "Valor (R$)", accessor: "valorTotalExibicao" },
        { header: "Data/Hora", accessor: "dataExibicao" },
        { header: "Pagamento", accessor: "formaPagamento" },
    ];

    const fetchVendas = async () => {
        try {
            setLoading(true);
            const res = await VendaService.getAll();
            const listaVendas = Array.isArray(res) ? res : [];

            if (listaVendas.length > 0) {
                const vendasComNomes = await Promise.all(
                    listaVendas.map(async (venda) => {
                        let nomeVend = "Carregando...";
                        try {
                            const func = await FuncionarioService.getById(venda.idVendedor);
                            nomeVend = func?.nome || "Desconhecido";
                        } catch (e) {
                            nomeVend = "Erro ao buscar";
                        }

                        return {
                            ...venda,
                            nomeVendedor: nomeVend,
                            valorTotalExibicao: venda.valorTotalDaVenda
                                ? `R$ ${venda.valorTotalDaVenda.toFixed(2).replace('.', ',')}`
                                : "R$ 0,00",
                            dataExibicao: new Date(venda.dataHora).toLocaleString('pt-BR')
                        };
                    })
                );
                setVendas(vendasComNomes);
            } else {
                setVendas([]);
            }
        } catch (err) {
            console.error("Erro no processamento das vendas:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendas();
    }, []);

    const dadosFiltrados = vendas.filter(v => {
        if (!termoBusca.trim()) return true;
        const termo = termoBusca.toLowerCase();
        return (v.nomeVendedor || "").toLowerCase().includes(termo) ||
               (v.formaPagamento || "").toLowerCase().includes(termo) ||
               (v.dataExibicao || "").toLowerCase().includes(termo);
    });

    const handleDeleteVenda = async (venda) => {
        if (!window.confirm(`Deseja realmente excluir a venda #${venda.id}?`)) return;
        try {
            await VendaService.delete(venda.id);
            fetchVendas();
        } catch (err) {
            alert("Erro ao excluir venda.");
        }
    };

    return (
        <div className="page-container">
            <TableContainer
                header={
                    <div className="header-actions">
                        <div className="button-wrapper">
                            <Button onClick={() => navigate('/painel-vendas')}>Adicionar Venda</Button>
                        </div>
                        <div className="search-wrapper">
                            <SearchBar
                                placeholder="Pesquisar por vendedor ou pagamento..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                            />
                        </div>
                    </div>
                }
            >
                {loading ? (
                    <div className="empty-table-placeholder">Carregando histórico...</div>
                ) : (
                    <DataTable
                        columns={colunas}
                        data={dadosFiltrados}
                        actions={(venda) => (
                            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                                {/* Visualizar - Olho */}
                                <IconButton
                                    icon={FiEye}
                                    onClick={() => {
                                        setVendaSelecionada(venda);
                                        setModalDetalhesAberto(true);
                                    }}
                                />
                                
                                {/* Editar - Lápis [CORRIGIDO AQUI] */}
                                <IconButton 
                                    icon={FiEdit} 
                                    onClick={() => {
                                        setVendaSelecionada(venda);
                                        setModalEditarAberto(true);
                                    }} 
                                />

                                {/* Excluir - Lixeira */}
                                <IconButton 
                                    icon={FiTrash} 
                                    onClick={() => handleDeleteVenda(venda)} 
                                />
                            </div>
                        )}
                    />
                )}
            </TableContainer>

            {/* Modais de Suporte */}
            <DetalhesVendaModal
                show={modalDetalhesAberto}
                onClose={() => setModalDetalhesAberto(false)}
                venda={vendaSelecionada}
            />

            <EditarVendaModal
                show={modalEditarAberto}
                onClose={() => setModalEditarAberto(false)}
                venda={vendaSelecionada}
                onUpdateSuccess={fetchVendas}
            />
        </div>
    );
}

export default Vendas;