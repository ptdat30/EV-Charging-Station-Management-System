import React, { useState } from 'react';
import { authService } from '../services/authService';

const DebugConnection = () => {
    const [testResult, setTestResult] = useState('');
    const [loading, setLoading] = useState(false);

    const testConnection = async () => {
        setLoading(true);
        setTestResult('Testing connection...');

        try {
            // Test login API
            const result = await authService.login('ptdat3000@gmail.com', '123123123');
            setTestResult(`SUCCESS: ${JSON.stringify(result, null, 2)}`);
        } catch (error) {
            setTestResult(`ERROR: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testDirectFetch = async () => {
        setLoading(true);
        setTestResult('Testing direct fetch...');

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'ptdat3000@gmail.com',
                    password: '123123123'
                })
            });

            const result = await response.text();
            setTestResult(`Direct Fetch - Status: ${response.status}, Response: ${result}`);
        } catch (error) {
            setTestResult(`Direct Fetch ERROR: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
            <h3>Debug Connection</h3>
            <button onClick={testConnection} disabled={loading}>
                Test API Connection
            </button>
            <button onClick={testDirectFetch} disabled={loading} style={{ marginLeft: '10px' }}>
                Test Direct Fetch
            </button>

            {loading && <p>Testing...</p>}
            {testResult && (
                <pre style={{
                    background: '#f5f5f5',
                    padding: '10px',
                    marginTop: '10px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                }}>
          {testResult}
        </pre>
            )}
        </div>
    );
};

export default DebugConnection;