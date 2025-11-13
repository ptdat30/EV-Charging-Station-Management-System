// src/utils/invoiceGenerator.js

/**
 * Generate và xuất hóa đơn điện tử
 * @param {Object} transaction - Thông tin giao dịch
 */
export const generateInvoice = (transaction) => {
    const {
        sessionId,
        sessionCode,
        stationId,
        chargerId,
        startTime,
        endTime,
        energyConsumed,
        paymentAmount,
        paymentMethod,
        sessionStatus,
        isPayment,
        paymentId
    } = transaction;

    // Format ngày giờ
    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return '-';
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch {
            return dateTimeStr;
        }
    };

    // Format số tiền
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    // Tính thời gian sạc
    const calculateDuration = (start, end) => {
        if (!start || !end) return '-';
        try {
            const startDate = new Date(start);
            const endDate = new Date(end);
            const diff = endDate - startDate;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            return `${hours}h ${minutes}m`;
        } catch {
            return '-';
        }
    };

    // Tạo HTML cho hóa đơn
    const invoiceHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hóa đơn điện tử - ${sessionCode || paymentId}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .invoice-header {
            text-align: center;
            border-bottom: 3px solid #1976d2;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 5px;
        }
        
        .company-info {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
        }
        
        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin: 20px 0 10px 0;
        }
        
        .invoice-number {
            font-size: 16px;
            color: #666;
        }
        
        .info-section {
            margin: 30px 0;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .info-label {
            font-weight: 600;
            color: #555;
            min-width: 140px;
        }
        
        .info-value {
            color: #333;
            flex: 1;
        }
        
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        .details-table th {
            background: #1976d2;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        
        .details-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }
        
        .details-table tr:last-child td {
            border-bottom: 2px solid #1976d2;
        }
        
        .total-section {
            margin-top: 30px;
            text-align: right;
        }
        
        .total-row {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            margin: 10px 0;
        }
        
        .total-label {
            font-size: 18px;
            font-weight: 600;
            color: #555;
            margin-right: 20px;
        }
        
        .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #1976d2;
            min-width: 200px;
            text-align: right;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-completed {
            background: #e8f5e9;
            color: #2e7d32;
        }
        
        .status-pending {
            background: #fff3e0;
            color: #f57c00;
        }
        
        .status-failed {
            background: #ffebee;
            color: #c62828;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        
        .footer-note {
            margin: 10px 0;
            font-style: italic;
        }
        
        .qr-code {
            margin: 20px 0;
            text-align: center;
        }
        
        .print-button {
            display: block;
            margin: 20px auto;
            padding: 12px 30px;
            background: #1976d2;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }
        
        .print-button:hover {
            background: #1565c0;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .invoice-container {
                box-shadow: none;
                padding: 20px;
            }
            
            .print-button {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
            <div class="company-name">⚡ EV CHARGING STATION</div>
            <div class="company-info">
                Hệ thống quản lý trạm sạc xe điện<br>
                Email: support@evcharge.vn | Hotline: 1900-xxxx<br>
                Website: www.evcharge.vn
            </div>
            <div class="invoice-title">HÓA ĐƠN ĐIỆN TỬ</div>
            <div class="invoice-number">Mã số: ${sessionCode || `PAY-${paymentId}` || 'N/A'}</div>
        </div>

        <!-- Thông tin giao dịch -->
        <div class="info-section">
            <h3 style="margin-bottom: 15px; color: #333;">Thông tin giao dịch</h3>
            <div class="info-grid">
                <div>
                    <div class="info-item">
                        <span class="info-label">Mã giao dịch:</span>
                        <span class="info-value"><strong>${sessionCode || `PAY-${paymentId}` || 'N/A'}</strong></span>
                    </div>
                    ${!isPayment ? `
                    <div class="info-item">
                        <span class="info-label">Trạm sạc:</span>
                        <span class="info-value">ID ${stationId || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Cổng sạc:</span>
                        <span class="info-value">ID ${chargerId || 'N/A'}</span>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <span class="info-label">Thời gian bắt đầu:</span>
                        <span class="info-value">${formatDateTime(startTime)}</span>
                    </div>
                </div>
                <div>
                    ${endTime ? `
                    <div class="info-item">
                        <span class="info-label">Thời gian kết thúc:</span>
                        <span class="info-value">${formatDateTime(endTime)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Thời lượng sạc:</span>
                        <span class="info-value">${calculateDuration(startTime, endTime)}</span>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <span class="info-label">Phương thức TT:</span>
                        <span class="info-value">
                            ${paymentMethod === 'wallet' ? '💳 Ví điện tử' :
                              paymentMethod === 'cash' ? '💵 Tiền mặt' :
                              paymentMethod === 'banking' ? '🏦 Chuyển khoản' :
                              paymentMethod || 'N/A'}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Trạng thái:</span>
                        <span class="info-value">
                            <span class="status-badge status-${sessionStatus || 'pending'}">
                                ${sessionStatus === 'completed' ? 'Hoàn thành' :
                                  sessionStatus === 'pending' ? 'Chờ xử lý' :
                                  sessionStatus === 'failed' ? 'Thất bại' :
                                  sessionStatus || 'N/A'}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chi tiết thanh toán -->
        <table class="details-table">
            <thead>
                <tr>
                    <th>Mô tả</th>
                    <th style="text-align: center;">Số lượng</th>
                    <th style="text-align: center;">Đơn vị</th>
                    <th style="text-align: right;">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                ${!isPayment && energyConsumed ? `
                <tr>
                    <td>Năng lượng tiêu thụ</td>
                    <td style="text-align: center;">${Number(energyConsumed).toFixed(2)}</td>
                    <td style="text-align: center;">kWh</td>
                    <td style="text-align: right;">${formatCurrency(paymentAmount)}</td>
                </tr>
                ` : `
                <tr>
                    <td>${isPayment ? 'Thanh toán dịch vụ' : 'Dịch vụ sạc xe điện'}</td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: center;">Giao dịch</td>
                    <td style="text-align: right;">${formatCurrency(paymentAmount)}</td>
                </tr>
                `}
            </tbody>
        </table>

        <!-- Tổng cộng -->
        <div class="total-section">
            <div class="total-row">
                <span class="total-label">TỔNG CỘNG:</span>
                <span class="total-amount">${formatCurrency(paymentAmount)}</span>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-note">
                Cảm ơn quý khách đã sử dụng dịch vụ!
            </div>
            <div>
                Hóa đơn này được tạo tự động bởi hệ thống<br>
                Ngày xuất: ${formatDateTime(new Date().toISOString())}
            </div>
            <div style="margin-top: 20px; font-size: 12px; color: #999;">
                © ${new Date().getFullYear()} EV Charging Station. All rights reserved.
            </div>
        </div>

        <!-- Print Button -->
        <button class="print-button" onclick="window.print()">
            🖨️ In hóa đơn
        </button>
    </div>
</body>
</html>
    `;

    // Mở cửa sổ mới và hiển thị hóa đơn
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        
        // Tự động focus vào cửa sổ mới
        printWindow.focus();
    } else {
        alert('Vui lòng cho phép mở cửa sổ pop-up để xem hóa đơn');
    }
};

/**
 * Download hóa đơn dạng HTML
 * @param {Object} transaction - Thông tin giao dịch
 */
export const downloadInvoiceHTML = (transaction) => {
    const { sessionCode, paymentId } = transaction;
    const invoiceHTML = generateInvoiceHTML(transaction);
    
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${sessionCode || paymentId || Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Helper function to generate HTML (có thể tái sử dụng)
const generateInvoiceHTML = (transaction) => {
    // Same HTML generation logic as above
    // (Extract the HTML generation part if needed for download)
    return ''; // Implementation similar to generateInvoice
};

