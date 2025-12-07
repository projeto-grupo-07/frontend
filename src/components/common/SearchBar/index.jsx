import './styles.css';

const SearchIcon = () => (
  <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
);

export function SearchBar({ placeholder, value, onChange }) {
  return (
    <div className="search-bar-container">
      <input 
        type="text" 
        className="search-input"
        placeholder={placeholder || "Pesquisar..."}
        value={value}
        onChange={onChange}
      />
      <SearchIcon />
    </div>
  );
}