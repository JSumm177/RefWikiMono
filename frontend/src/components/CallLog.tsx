import React from 'react';
import type { Call } from '../CallHistoryContext';

interface CallLogProps {
    calls: Call[];
}

const getControversyColor = (level: number) => {
    switch (level) {
        case 1: return '#4CAF50';
        case 2: return '#8BC34A';
        case 3: return '#FFC107';
        case 4: return '#FF9800';
        case 5: return '#F44336';
        default: return '#ccc';
    }
};

const CallLog: React.FC<CallLogProps> = ({ calls }) => {
    return (
        <>
            <h2>Live Call Log</h2>
            {calls.length === 0 ? (
                <p>No calls logged yet. Head to Log Call!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {calls.map(item => (
                        <div key={item.id} style={{
                            backgroundColor: '#f9f9f9',
                            padding: '15px',
                            borderRadius: '8px',
                            borderLeft: `6px solid ${getControversyColor(item.controversyLevel)}`,
                            borderTop: '1px solid #eee',
                            borderRight: '1px solid #eee',
                            borderBottom: '1px solid #eee',
                            textAlign: 'left'
                        }}>
                            <h3 style={{ margin: '0 0 5px 0' }}>{item.penaltyName}</h3>
                            <div style={{ color: '#555', marginBottom: '5px' }}>{item.ruleReference}</div>
                            <div style={{ color: '#333', marginBottom: '10px' }}>{item.notes}</div>
                            <div style={{ fontSize: '0.8em', color: '#999', textAlign: 'right' }}>
                                {new Date(item.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default CallLog;
