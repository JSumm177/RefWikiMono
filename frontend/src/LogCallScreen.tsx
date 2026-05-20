import React, { useState, useContext, useRef, useEffect } from 'react';
import { CallHistoryContext } from './CallHistoryContext';
import { useNavigate } from 'react-router-dom';
import { searchRules } from './utils/search';
import type { SearchableRule } from './utils/search';

const CONTROVERSY_LEVELS = [
  { level: 1, label: 'Textbook', description: 'Clear-cut, no debate', color: 'var(--c1)' },
  { level: 2, label: 'Technically Correct', description: 'Letter of the Law vs. Spirit', color: 'var(--c2)' },
  { level: 3, label: 'Let \'em Play', description: 'Ticky-tack call', color: 'var(--c3)' },
  { level: 4, label: 'Game Changer', description: 'Massive penalty', color: 'var(--c4)' },
  { level: 5, label: 'Total Robbery', description: 'Refs absolutely blew it', color: 'var(--c5)' },
];

const LogCallScreen: React.FC = () => {
  const { addCall } = useContext(CallHistoryContext);
  const navigate = useNavigate();

  const [penaltyName, setPenaltyName] = useState('');
  const [ruleReference, setRuleReference] = useState('');
  const [notes, setNotes] = useState('');
  const [sport, setSport] = useState('NFL');
  const [team, setTeam] = useState('');
  const [controversyLevel, setControversyLevel] = useState(1);
  const [isPublic, setIsPublic] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!penaltyName || !ruleReference) {
      alert('Please enter a penalty name and rule reference.');
      return;
    }

    await addCall({
      penaltyName,
      ruleReference,
      controversyLevel,
      notes,
      sport,
      team,
      isPublic,
    });

    setPenaltyName('');
    setRuleReference('');
    setNotes('');
    setSport('NFL');
    setTeam('');
    setControversyLevel(1);
    setIsPublic(false);

    alert('Call logged to history!');
    navigate('/');
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Log a Recent Call</h2>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div style={{ flex: 1 }}>
              <label className="form-label">Sport</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="form-input-field"
              >
                <option value="NFL">NFL</option>
                <option value="NCAA">College Football</option>
                <option value="NBA">NBA</option>
                <option value="MLB">MLB</option>
                <option value="NHL">NHL</option>
                <option value="MLS">MLS (Soccer)</option>
              </select>
            </div>
            <div style={{ flex: 2 }}>
              <label className="form-label">Team</label>
              <input
                type="text"
                placeholder="e.g. Chiefs"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="form-input-field"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Penalty Name</label>
            <input
              type="text"
              placeholder="e.g. Defensive Pass Interference"
              value={penaltyName}
              onChange={(e) => setPenaltyName(e.target.value)}
              className="form-input-field"
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }} ref={dropdownRef}>
            <label className="form-label">Rule Reference</label>
            <input
              type="text"
              placeholder="e.g. Rule 8, Section 5"
              value={ruleReference}
              onChange={async (e) => {
                const val = e.target.value;
                setRuleReference(val);
                if (val.trim() !== '') {
                  const results = await searchRules(sport, val);
                  setSearchResults(results);
                  setShowDropdown(true);
                } else {
                  setSearchResults([]);
                  setShowDropdown(false);
                }
              }}
              onFocus={async () => {
                if (ruleReference.trim() !== '') {
                  const results = await searchRules(sport, ruleReference);
                  setSearchResults(results);
                  setShowDropdown(true);
                }
              }}
              className="form-input-field"
            />
            {showDropdown && searchResults.length > 0 && (
              <ul className="autocomplete-menu" style={{ zIndex: 100 }}>
                {searchResults.slice(0, 10).map((rule, idx) => (
                  <li
                    key={`${rule.id}-${idx}`}
                    className="autocomplete-item"
                    onClick={() => {
                      setRuleReference(rule.fullReference);
                      setShowDropdown(false);
                    }}
                  >
                    <strong>{rule.fullReference}</strong>: {rule.ruleTitle} - {rule.sectionTitle}
                    <div className="autocomplete-item-desc">
                      {rule.articleText}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Controversy Level</label>
            <div className="controversy-list">
              {CONTROVERSY_LEVELS.map((item) => {
                const isActive = controversyLevel === item.level;
                return (
                  <button
                    type="button"
                    key={item.level}
                    onClick={() => setControversyLevel(item.level)}
                    className={`controversy-option-card ${isActive ? `active-${item.level}` : ''}`}
                  >
                    <div className="option-card-title">
                      {item.level}. {item.label}
                    </div>
                    {isActive && (
                      <div className="option-card-desc">{item.description}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              placeholder="Looked like a clean break on the ball..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input-field"
              style={{ minHeight: '110px', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="isPublic" className="form-checkbox-container">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="form-checkbox"
              />
              <span className="form-checkbox-label">Publish to Community Feed</span>
            </label>
          </div>

          <button type="submit" className="btn-primary">
            Log Call
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogCallScreen;
