import React, { useState, useContext, useRef, useEffect } from 'react';
import { CallHistoryContext } from './CallHistoryContext';
import { useNavigate } from 'react-router-dom';
import { searchRules } from './utils/search';
import type { SearchableRule } from './utils/search';

const CONTROVERSY_LEVELS = [
  { level: 1, label: 'Textbook', description: 'Clear-cut, no debate', color: '#4CAF50' },
  { level: 2, label: 'Technically Correct', description: 'Letter of the Law vs. Spirit', color: '#8BC34A' },
  { level: 3, label: 'Let \'em Play', description: 'Ticky-tack call', color: '#FFC107' },
  { level: 4, label: 'Game Changer', description: 'Massive penalty', color: '#FF9800' },
  { level: 5, label: 'Total Robbery', description: 'Refs absolutely blew it', color: '#F44336' },
];

const LogCallScreen: React.FC = () => {
  const { addCall } = useContext(CallHistoryContext);
  const navigate = useNavigate();

  const [penaltyName, setPenaltyName] = useState('');
  const [ruleReference, setRuleReference] = useState('');
  const [notes, setNotes] = useState('');
  const [controversyLevel, setControversyLevel] = useState(1);
  const [searchResults, setSearchResults] = useState<SearchableRule[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!penaltyName || !ruleReference) {
      alert('Please enter a penalty name and rule reference.');
      return;
    }

    addCall({
      penaltyName,
      ruleReference,
      controversyLevel,
      notes,
    });

    setPenaltyName('');
    setRuleReference('');
    setNotes('');
    setControversyLevel(1);

    alert('Call logged to history!');
    navigate('/');
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: '#f9f9f9',
    marginBottom: '15px',
    boxSizing: 'border-box' as const
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Log a Recent Call</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Penalty Name</label>
        <input
          type="text"
          placeholder="e.g. Defensive Pass Interference"
          value={penaltyName}
          onChange={(e) => setPenaltyName(e.target.value)}
          style={inputStyle}
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Rule Reference</label>
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <input
            type="text"
            placeholder="e.g. Rule 8, Section 5"
            value={ruleReference}
            onChange={(e) => {
              const val = e.target.value;
              setRuleReference(val);
              if (val.trim() !== '') {
                setSearchResults(searchRules(val));
                setShowDropdown(true);
              } else {
                setSearchResults([]);
                setShowDropdown(false);
              }
            }}
            onFocus={() => {
              if (ruleReference.trim() !== '') {
                setSearchResults(searchRules(ruleReference));
                setShowDropdown(true);
              }
            }}
            style={{ ...inputStyle, marginBottom: showDropdown ? '0' : '15px' }}
          />
          {showDropdown && searchResults.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderTop: 'none',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              listStyle: 'none',
              padding: 0,
              margin: 0,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              zIndex: 10
            }}>
              {searchResults.slice(0, 10).map((rule, idx) => (
                <li
                  key={`${rule.ruleId}-${rule.sectionId}-${rule.articleId}-${idx}`}
                  style={{
                    padding: '10px 12px',
                    borderBottom: idx === Math.min(searchResults.length, 10) - 1 ? 'none' : '1px solid #eee',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onClick={() => {
                    setRuleReference(rule.fullReference);
                    setShowDropdown(false);
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <strong>{rule.fullReference}</strong>: {rule.ruleTitle} - {rule.sectionTitle}
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rule.articleText}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Spacer to maintain gap if dropdown is active but not pushing content down as it's absolute */}
        {showDropdown && <div style={{ marginBottom: '15px' }}></div>}

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Controversy Level</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
          {CONTROVERSY_LEVELS.map((item) => (
            <button
              type="button"
              key={item.level}
              onClick={() => setControversyLevel(item.level)}
              style={{
                padding: '12px',
                border: `1px solid ${controversyLevel === item.level ? item.color : '#ddd'}`,
                borderRadius: '8px',
                backgroundColor: controversyLevel === item.level ? item.color : '#f9f9f9',
                color: controversyLevel === item.level ? '#fff' : '#333',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.level}. {item.label}</div>
              {controversyLevel === item.level && (
                <div style={{ fontSize: '14px', marginTop: '4px' }}>{item.description}</div>
              )}
            </button>
          ))}
        </div>

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Notes</label>
        <textarea
          placeholder="Looked like a clean break on the ball..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
        />

        <button type="submit" style={{
          width: '100%',
          backgroundColor: '#007BFF',
          color: '#fff',
          padding: '15px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '10px'
        }}>
          Log Call
        </button>
      </form>
    </div>
  );
};

export default LogCallScreen;
