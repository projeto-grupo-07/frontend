import api from './api/api';


// Adicione junto com as suas outras funções de requisição
export const ComissaoService = {
    getResumo: async (idFuncionario) => {
        const res = await api.get(`/comissoes/${idFuncionario}/resumo`);
        return res;
    },
    getHistorico: async (idFuncionario) => {
        const res = await api.get(`/comissoes/${idFuncionario}/pagamentos`);
        return res;
    },
    registrarPagamento: async (idFuncionario, dados) => {
        const res = await api.post(`/comissoes/${idFuncionario}/pagamentos`, dados);
        return res;
    }
};