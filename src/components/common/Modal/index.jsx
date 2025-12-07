import "./styles.css";

export function Modal({ show, title, children, onClose }) {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {children}
                </div>

            </div>
        </div>
    );
}
