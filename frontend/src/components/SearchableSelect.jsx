import React, { useState, useEffect, useRef } from 'react';

const SearchableSelect = ({ options = [], value, onChange, placeholder, required, grouped = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Group options by category if grouped prop is true
  const groupedOptions = grouped ? options.reduce((acc, opt) => {
    const category = opt.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(opt);
    return acc;
  }, {}) : null;

  const filteredOptions = searchTerm 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      {required && (
        <input 
          tabIndex={-1}
          autoComplete="off"
          style={{ opacity: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
          value={value || ''}
          onChange={() => {}}
          required={required}
        />
      )}
      
      <div 
        style={{
          padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px',
          backgroundColor: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', minHeight: '42px', fontSize: '14px'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: selectedOption ? '#333' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '8px' }}>▼</span>
      </div>
      
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
          backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)', marginTop: '4px', maxHeight: '300px',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
            <input 
              type="text"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', 
                borderRadius: '6px', outline: 'none', fontSize: '14px', boxSizing: 'border-box'
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '10px 16px', color: '#94a3b8', fontSize: '14px', textAlign: 'center' }}>No matches found</div>
            ) : grouped && !searchTerm ? (
              // Show grouped view when not searching
              Object.entries(groupedOptions).map(([category, items]) => (
                <div key={category}>
                  <div style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#f8fafc', 
                    color: '#64748b', 
                    fontSize: '12px', 
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    position: 'sticky',
                    top: '0',
                    zIndex: 10,
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    {category}
                  </div>
                  {items.map(opt => (
                    <div 
                      key={opt.value}
                      style={{
                        padding: '10px 16px 10px 24px', cursor: 'pointer', fontSize: '14px',
                        backgroundColor: String(opt.value) === String(value) ? '#eff6ff' : 'transparent',
                        color: String(opt.value) === String(value) ? '#1d4ed8' : '#334155',
                        fontWeight: String(opt.value) === String(value) ? '600' : 'normal'
                      }}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      onMouseEnter={(e) => { if (String(opt.value) !== String(value)) e.target.style.backgroundColor = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.target.style.backgroundColor = String(opt.value) === String(value) ? '#eff6ff' : 'transparent'; }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              // Show flat list when searching
              filteredOptions.map(opt => (
                <div 
                  key={opt.value}
                  style={{
                    padding: '10px 16px', cursor: 'pointer', fontSize: '14px',
                    backgroundColor: String(opt.value) === String(value) ? '#eff6ff' : 'transparent',
                    color: String(opt.value) === String(value) ? '#1d4ed8' : '#334155',
                    fontWeight: String(opt.value) === String(value) ? '600' : 'normal'
                  }}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  onMouseEnter={(e) => { if (String(opt.value) !== String(value)) e.target.style.backgroundColor = '#f8fafc'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = String(opt.value) === String(value) ? '#eff6ff' : 'transparent'; }}
                >
                  {opt.label}
                  {opt.category && <span style={{ marginLeft: '8px', color: '#94a3b8', fontSize: '12px' }}>({opt.category})</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
