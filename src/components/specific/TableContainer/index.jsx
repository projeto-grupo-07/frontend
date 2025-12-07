import './styles.css';

export function TableContainer({ header, children }) {
    return (
        <div className="table-container">
            <div className="table-header-wrapper">
                {header}
            </div>

            <div className="table-content">
                {children}
            </div>
        </div>
    );
}