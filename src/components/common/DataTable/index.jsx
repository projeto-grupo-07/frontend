import './styles.css';

export function DataTable({ columns, data, actions }) {
    return (
        <table className="custom-table">
            <thead>
                <tr>
                    {columns.map((col, index) => (
                        <th key={index}>{col.header}</th>
                    ))}
                    {actions && <th>Ações</th>}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {columns.map((col, colIndex) => (
                            <td key={colIndex}>
                                {row[col.accessor]}
                            </td>
                        ))}
                        
                        {actions && (
                            <td>
                                {actions(row)}
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}