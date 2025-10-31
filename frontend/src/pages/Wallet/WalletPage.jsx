import React, { useEffect, useState } from 'react';
import { getWallet, getBalance } from '../../services/walletService';
import TopUpModal from '../../components/TopUpModal';
import '../../styles/Wallet.css';

export default function WalletPage() {
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [topUpModalOpen, setTopUpModalOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const walletData = await getWallet();
            setBalance(walletData.balance || 0);
            setHistory(walletData.transactions || []);
        } catch (e) {
            console.error('Error loading wallet:', e);
            // Fallback: try to load balance only
            try {
                const balanceData = await getBalance();
                setBalance(balanceData.balance || 0);
            } catch (err) {
                setError(e.message || 'Không thể tải ví');
            }
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleTopUpSuccess = () => {
        loadData(); // Reload wallet data after successful top-up
    };

    return (
        <div className="wallet-page">
            <div className="wallet-container">
                {error && (
                    <div className="wallet-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                <div className="wallet-balance-card">
                    <div className="balance-info">
                        <div className="balance-label">Số dư hiện tại</div>
                        <div className="balance-amount">{balance.toLocaleString()} ₫</div>
                    </div>
                    <div className="balance-icon">
                        <i className="fas fa-coins"></i>
                    </div>
                </div>

                <div className="wallet-actions">
                    <button 
                        className="btn-topup"
                        onClick={() => setTopUpModalOpen(true)}
                    >
                        <i className="fas fa-plus-circle"></i>
                        Nạp tiền
                    </button>
                </div>

                {/* Top Up Modal */}
                <TopUpModal
                    isOpen={topUpModalOpen}
                    onClose={() => setTopUpModalOpen(false)}
                    onSuccess={handleTopUpSuccess}
                />

                <div className="wallet-transactions">
                    <h2>
                        <i className="fas fa-history"></i>
                        Lịch sử giao dịch
                    </h2>
                    
                    {loading ? (
                        <div className="wallet-loading">
                            <div className="spinner"></div>
                            <p>Đang tải lịch sử...</p>
                        </div>
                    ) : history && history.length > 0 ? (
                        <div className="transactions-list">
                            {history.map((t, idx) => (
                                <div key={idx} className="transaction-item">
                                    <div className="transaction-icon">
                                        <i className={`fas ${
                                            t.type?.toLowerCase().includes('nạp') || t.type?.toLowerCase().includes('deposit') 
                                                ? 'fa-arrow-down' 
                                                : 'fa-arrow-up'
                                        }`}></i>
                                    </div>
                                    <div className="transaction-details">
                                        <div className="transaction-type">{t.type || 'Giao dịch'}</div>
                                        <div className="transaction-date">{t.timestamp || t.createdAt || ''}</div>
                                    </div>
                                    <div className={`transaction-amount ${
                                        t.type?.toLowerCase().includes('nạp') || t.type?.toLowerCase().includes('deposit')
                                            ? 'positive'
                                            : 'negative'
                                    }`}>
                                        {t.type?.toLowerCase().includes('nạp') || t.type?.toLowerCase().includes('deposit') ? '+' : '-'}
                                        {Math.abs(t.amount || 0).toLocaleString()} ₫
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="wallet-empty">
                            <i className="fas fa-inbox"></i>
                            <p>Chưa có giao dịch nào</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


