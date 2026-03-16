import { useState, useEffect } from 'react';
import { FiEdit, FiTrash, FiSearch } from "react-icons/fi";
import { TableContainer } from '../../components/specific/TableContainer';
import { DataTable } from '../../components/common/DataTable';
import { IconButton } from '../../components/common/IconButton';
import { FuncionarioService } from '../../services/FuncionarioService';
import { KpiService } from '../../services/KpiService';
import EditarComissaoModal from "../../components/common/EditarComissaoModal";
import './styles.css';

function Comissao() {
    const [dadosTabela, setDadosTabela] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState("");
    const [modalAberto, setModalAberto] = useState(false);
    const [funcionarioParaEditar, setFuncionarioParaEditar] = useState(null);

    // 1. COLUNAS
    const colunas = [
        { header: "Nome Funcionário", accessor: "nome" },
        { header: "Taxa (%)", accessor: "taxaComissaoFormatada" }, 
        { header: "Qtd Vendas", accessor: "qtdVendas" },
        { header: "Faturamento", accessor: "faturamentoFormatado" },
        { header: "Comissão", accessor: "comissaoFormatada" },
    ];

    const carregarDadosComissao = async () => {
        try {
            setLoading(true);
            const funcionarios = await FuncionarioService.getAll();
            const ativos = (funcionarios || []).filter(f => f.ativo !== false);

            const listaComMetricas = await Promise.all(ativos.map(async (func) => {
                const [faturamento, comissao, qtdVendas] = await Promise.all([
                    KpiService.getFaturamentoPorVendedor(func.id),
                    KpiService.getComissaoPorVendedor(func.id),
                    KpiService.getQuantidadeVendasPorVendedor(func.id)
                ]);

                console.log(`Vendedor ${func.nome}:`, { faturamento, comissao, qtdVendas });

                return {
                    ...func,
                    taxaComissaoFormatada: func.comissao != null ? `${(func.comissao * 100).toFixed(0)}%` : "0%",
                    
                    qtdVendas: qtdVendas || 0,
                    faturamentoFormatado: faturamento ? `R$ ${faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ 0,00",
                    comissaoFormatada: comissao ? `R$ ${comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ 0,00"
                };
            }));

            setDadosTabela(listaComMetricas);
        } catch (error) {
            console.error("Erro ao carregar dados de comissão:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDadosComissao();
    }, []);

    const dadosFiltrados = dadosTabela.filter(f =>
        f.nome.toLowerCase().includes(termoBusca.toLowerCase())
    );

    return (
        <div className="comissao-page">
            <TableContainer
                header={
                    <div className="comissao-header-content" style={{ width: '100%', boxSizing: 'border-box' }}>
                        
                        {/* BARRA DE PESQUISA BLINDADA (100% de largura garantido) */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            backgroundColor: '#fff', 
                            borderRadius: '8px', 
                            padding: '10px 16px', 
                            width: '100%', 
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                            border: '1px solid #cbd5e0',
                            boxSizing: 'border-box'
                        }}>
                            <FiSearch color="#a0aec0" size={18} style={{ marginRight: '10px', flexShrink: 0 }} />
                            <input 
                                type="text" 
                                placeholder="Pesquisar por nome do funcionário..." 
                                value={termoBusca} 
                                onChange={(e) => setTermoBusca(e.target.value)}
                                style={{ 
                                    border: 'none', 
                                    outline: 'none', 
                                    width: '100%', 
                                    fontSize: '15px', 
                                    color: '#2d3748', 
                                    backgroundColor: 'transparent' 
                                }}
                            />
                        </div>

                    </div>
                }
            >
                {loading ? (
                    <div className="loading-state">Carregando dados de comissão...</div>
                ) : (
                    <DataTable
                        columns={colunas}
                        data={dadosFiltrados}
                        actions={(item) => (
                            <div className="action-buttons">
                                <IconButton
                                    icon={FiEdit}
                                    onClick={() => {
                                        setFuncionarioParaEditar(item);
                                        setModalAberto(true);
                                    }}
                                />
                                <IconButton icon={FiTrash} onClick={() => console.log("Excluir", item.id)} />
                            </div>
                        )}
                    />
                )}
            </TableContainer>
            
            <EditarComissaoModal
                show={modalAberto}
                onClose={() => setModalAberto(false)}
                funcionario={funcionarioParaEditar}
                onUpdateSuccess={carregarDadosComissao}
            />
        </div>
    );
}

export default Comissao;