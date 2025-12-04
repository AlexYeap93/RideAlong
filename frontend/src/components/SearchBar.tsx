// Bootstrap implementation
import { Search } from "lucide-react";
import { SearchBarProps } from "../serviceInterface";

export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="p-4 bg-white">
      <div className="position-relative d-flex align-items-center" style={{ gap: '0.5rem' }}>
        <div className="position-relative flex-grow-1">
          <Search 
            className="position-absolute" 
            style={{ 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#717182',
              width: '1.25rem',
              height: '1.25rem',
              zIndex: 10,
              pointerEvents: 'none'
            }} 
          />
          <input
            type="text"
            className="form-control"
            placeholder="Where are you going?"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              paddingLeft: '2.5rem',
              paddingRight: '1rem',
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              backgroundColor: '#f3f3f5',
              borderColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '0.5rem'
            }}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={onSearch}
          style={{ 
            flexShrink: 0,
            backgroundColor: '#030213',
            borderColor: '#030213',
            color: '#ffffff'
          }}
        >
          Search
        </button>
      </div>
    </div>
  );
}