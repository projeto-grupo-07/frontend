import React from 'react';

function PaginaEmConstrucao({ title, message }) {
    const pageTitle = title || "Em Construção";
    const defaultMessage = message || "Esta página está em desenvolvimento e estará disponível em breve.";

    return (
        <>
                <title>{pageTitle} | Nome do Seu App</title>

            <div style={{
                textAlign: 'center',
                padding: '50px 20px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                margin: '50px auto',
                maxWidth: '600px',
                borderTop: '5px solid #2563eb'
            }}>
                
                <span role="img" aria-label="Construção" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>
                    🚧
                </span>

                <h1 style={{ color: '#1f2937', fontSize: '1.8rem', marginBottom: '1rem' }}>
                    {pageTitle}
                </h1>

                <p style={{ color: '#4b5563', fontSize: '1rem', lineHeight: '1.5' }}>
                    {defaultMessage}
                </p>

                <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    Agradecemos a sua paciência.
                </p>
            </div>
        </>
    );
}

export default PaginaEmConstrucao;