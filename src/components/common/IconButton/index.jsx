import './styles.css';

export function IconButton({ icon: Icon, onClick, color = "#1a2340", size = 18 }) {
    return (
        <button className="icon-button" onClick={onClick}>
            <Icon size={size} color={color} />
        </button>
    );
}