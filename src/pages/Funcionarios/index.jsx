import { useState, useEffect } from 'react';
import { FiEdit, FiTrash } from "react-icons/fi";
import { TableContainer } from '../../components/specific/TableContainer';
import { SearchBar } from '../../components/common/SearchBar';
import { DataTable } from '../../components/common/DataTable';
import { IconButton } from '../../components/common/IconButton';
import { FuncionarioService } from '../../services/FuncionarioService';
import EditarFuncionarioModal from "../../components/common/EditarFuncionarioModal";
import CadastrarFuncionarioModal from "../../components/common/CadastrarFuncionarioModal"
import './styles.css';

function Funcionarios() {
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState("");
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
    const [modalCadastroAberto, setModalCadastroAberto] = useState(false);

    const colunas = [
        { header: "Nome", accessor: "nome" },
        { header: "Email", accessor: "email" },
        { header: "Cargo", accessor: "cargo" },
        { header: "Comissão", accessor: "comissaoFormatada" },
    ];

    // Função auxiliar para formatar strings de cargo
    const formatarCargo = (perfil) => {
        if (!perfil || !perfil.nome) return "Não Atribuído";
        const nomeRaw = perfil.nome.toLowerCase();
        return nomeRaw.charAt(0).toUpperCase() + nomeRaw.slice(1);
    };

    const loadFuncionarios = async () => {
        try {
            setLoading(true);
            const res = await FuncionarioService.getAll();
            const lista = Array.isArray(res) ? res : [];

            const formatados = lista
                .filter(f => f.ativo !== false) 
                .map(f => ({
                    ...f,
                    cargo: formatarCargo(f.perfil),
                    comissaoFormatada: f.comissao
                        ? `${(f.comissao * 100).toFixed(0)}%`
                        : "0%"
                }));

            setFuncionarios(formatados);
        } catch (err) {
            console.error("Erro ao carregar funcionários:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFuncionarios();
    }, []);

    const handleDelete = async (id) => {
        const confirmacao = window.confirm("Deseja realmente remover este funcionário? (Ele será desativado do sistema)");
        if (!confirmacao) return;

        try {
            await FuncionarioService.delete(id);
            alert("Funcionário desativado com sucesso!");
            loadFuncionarios(); 
        } catch (err) {
            alert("Erro ao desativar funcionário. Verifique a conexão.");
        }
    };

    const dadosFiltrados = funcionarios.filter(f =>
        (f.nome || "").toLowerCase().includes(termoBusca.toLowerCase()) ||
        (f.email || "").toLowerCase().includes(termoBusca.toLowerCase())
    );

    return (
        <div className="page-container">
            <TableContainer
                header={
                    // Novo cabeçalho blindado com Flexbox
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', width: '100%', paddingBottom: '8px' }}>
                        
                        <button 
                            onClick={() => setModalCadastroAberto(true)}
                            style={{ 
                                padding: '10px 24px', 
                                backgroundColor: '#ed64a6', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontWeight: 'bold', 
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                width: 'fit-content', // Mantém o botão compacto
                                fontSize: '15px'
                            }}
                        >
                            + Adicionar Funcionário
                        </button>

                        {/* O flex: 1 sem maxWidth faz a barra ocupar todo o espaço restante */}
                        <div style={{ flex: 1 }}>
                            <SearchBar
                                placeholder="Pesquisar por nome ou email..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                            />
                        </div>

                    </div>
                }
            >
                {loading ? (
                    <div className="empty-table-placeholder">Buscando dados da equipe...</div>
                ) : (
                    <DataTable
                        columns={colunas}
                        data={dadosFiltrados}
                        actions={(func) => (
                            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                                <IconButton
                                    icon={FiEdit}
                                    onClick={() => {
                                        setFuncionarioSelecionado(func);
                                        setModalEditarAberto(true);
                                    }}
                                />
                                <IconButton 
                                    icon={FiTrash} 
                                    onClick={() => handleDelete(func.id)} 
                                />
                            </div>
                        )}
                    />
                )}
            </TableContainer>

            <EditarFuncionarioModal
                show={modalEditarAberto}
                onClose={() => setModalEditarAberto(false)}
                funcionario={funcionarioSelecionado}
                onUpdateSuccess={loadFuncionarios}
            />

            <CadastrarFuncionarioModal 
                show={modalCadastroAberto}
                onClose={() => setModalCadastroAberto(false)}
                onSuccess={loadFuncionarios}
            />
        </div>
    );
}

export default Funcionarios;