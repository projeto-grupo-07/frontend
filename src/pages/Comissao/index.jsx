import { useState, useEffect } from 'react';
import { FiEdit, FiTrash } from "react-icons/fi";
import { TableContainer } from '../../components/specific/TableContainer';
import { SearchBar } from '../../components/common/SearchBar';
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



    const colunas = [
        { header: "Nome Funcionário", accessor: "nome" },
        { header: "Qtd Vendas", accessor: "qtdVendas" },
        { header: "Faturamento", accessor: "faturamentoFormatado" },
        { header: "Comissão", accessor: "comissaoFormatada" },
    ];

    const carregarDadosComissao = async () => {
        try {
            setLoading(true);
            // 1. Busca a lista de funcionários ativos
            const funcionarios = await FuncionarioService.getAll();
            const ativos = (funcionarios || []).filter(f => f.ativo !== false);

            // 2. Mapeia os funcionários buscando os KPIs de cada um em paralelo
            const listaComMetricas = await Promise.all(ativos.map(async (func) => {
                // Chamada tripla para obter todos os dados do vendedor
                const [faturamento, comissao, qtdVendas] = await Promise.all([
                    KpiService.getFaturamentoPorVendedor(func.id),
                    KpiService.getComissaoPorVendedor(func.id),
                    KpiService.getQuantidadeVendasPorVendedor(func.id)
                ]);

                console.log(`Vendedor ${func.nome}:`, { faturamento, comissao, qtdVendas });

                return {
                    ...func,
                    // Agora o valor vem do backend em vez de ser zero
                    qtdVendas: qtdVendas || 0,
                    faturamentoFormatado: faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                    comissaoFormatada: comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
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
                    <div className="comissao-header-content">
                        <SearchBar
                            placeholder="Pesquisar..."
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                        />
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