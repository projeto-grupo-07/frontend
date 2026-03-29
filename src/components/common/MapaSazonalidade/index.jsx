import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { KpiService } from '../../../services/KpiService'; // Ajuste o caminho conforme seu projeto

const CORES = ['#5B6F8A', '#FF70A6', '#38A169', '#D69E2E', '#805AD5', '#E53E3E'];

export default function MapaSazonalidade({ ano }) {
    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const carregarDados = async () => {
            setLoading(true);
            try {
                // 1. Pega o ano atual se não for passado nenhum
                const anoBusca = ano || new Date().getFullYear();
                
                // 2. Busca os dados da nossa nova rota no Java
                const res = await KpiService.getMapaSazonalidade(anoBusca);
                const dadosBrutos = res.data || res || []; // Defesa caso use axios interceptor

                // 3. Monta o esqueleto dos 12 meses
                const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                const estruturaAno = mesesNomes.map((nome, index) => ({
                    mes: nome,
                    mesIndex: index + 1
                }));

                const setCats = new Set();

                // 4. Preenche os meses com os dados do Java
                dadosBrutos.forEach(item => {
                    const mesAlvo = estruturaAno.find(m => m.mesIndex === item.mes || m.mesIndex === item.Mes);
                    const nomeCat = item.categoria || item.Categoria;
                    const qtd = item.quantidade || item.Quantidade;

                    if (mesAlvo && nomeCat) {
                        mesAlvo[nomeCat] = qtd;
                        setCats.add(nomeCat);
                    }
                });

                setCategorias(Array.from(setCats));
                setDadosGrafico(estruturaAno);

            } catch (error) {
                console.error("Erro ao montar Mapa de Sazonalidade:", error);
            } finally {
                setLoading(false);
            }
        };

        carregarDados();
    }, [ano]);

    if (loading) {
        return <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0' }}>Analisando tendências...</div>;
    }

    if (dadosGrafico.length === 0 || categorias.length === 0) {
        return <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', fontStyle: 'italic' }}>Nenhuma venda registrada neste ano.</div>;
    }

    return (
        <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer>
                <LineChart data={dadosGrafico} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 12 }} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value, name) => [`${value} Un.`, name]}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    
                    {/* Renderiza uma linha dinâmica para cada categoria de sapato encontrada */}
                    {categorias.map((cat, index) => (
                        <Line 
                            key={cat}
                            type="monotone" 
                            dataKey={cat} 
                            name={cat}
                            stroke={CORES[index % CORES.length]} 
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                            connectNulls={true} 
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}