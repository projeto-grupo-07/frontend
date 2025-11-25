import './styles.css'

function Input({ label, type, placeholder, value, onChange }) {
    return (
        <div className='input-wrapper'>
            <label className='lblInput'>{label}</label>
            <input 
                type={type} 
                placeholder={placeholder} 
                value={value} 
                onChange={onChange} 
                className="custom-input"
            />
        </div>
    )
}

export default Input