/**
 * DSA Visualizer - Export Trace to PDF (js/export-trace.js)
 * Kết xuất bảng chạy tay từng bước (Dry-Run Trace Table) ra định dạng PDF in ấn A4 chuẩn chỉnh:
 * - Render tài liệu HTML chuẩn vector với typography tiếng Việt không lỗi font.
 * - Hiển thị đầy đủ thông số thuật toán, độ phức tạp, mảng đầu vào và các bước thực thi (<->).
 * - Tự động kích hoạt hộp thoại Lưu PDF / In ấn sắc nét trên mọi trình duyệt hiện đại.
 */

/**
 * Tạo mã HTML hoàn chỉnh phục vụ in ấn A4 và xuất PDF
 */
function generateTracePrintHTML(algo, steps = []) {
  const algoName = algo ? algo.name : 'Thuật toán';
  const group = algo ? algo.group : 'DSA';
  const worst = algo?.complexity?.worst || '-';
  const best = algo?.complexity?.best || '-';
  const space = algo?.complexity?.space || '-';
  const total = steps.length;
  const initialArr = steps[0]?.array?.map(x => x.value).join(', ') || '';
  const nowStr = new Date().toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let rowsHtml = '';
  steps.forEach((step, idx) => {
    const stepNum = idx + 1;
    const arr = step.array || [];

    // 1. Phân loại badge hành động
    let actionBadgeClass = 'badge-init';
    let actionText = 'ℹ️ Chi tiết';

    if (idx === 0) {
      actionBadgeClass = 'badge-init';
      actionText = '🚀 Khởi tạo';
    } else if (step.isComplete) {
      actionBadgeClass = 'badge-ok';
      actionText = '🎉 Hoàn tất';
    } else if (step.isUserStep) {
      const evalRes = step.userEvaluation;
      if (evalRes && evalRes.isCorrect === false && !evalRes.isSearch) {
        actionBadgeClass = 'badge-err';
        actionText = evalRes.badgeText || '⚠️ Thử sai';
      } else {
        actionBadgeClass = 'badge-ok';
        actionText = evalRes?.badgeText || '✓ Bạn đổi';
      }
    } else if (step.highlights) {
      const hlValues = Object.values(step.highlights);
      if (hlValues.includes('swp')) {
        actionBadgeClass = 'badge-swp';
        actionText = '🔄 Đổi chỗ';
      } else if (hlValues.includes('cmp')) {
        actionBadgeClass = 'badge-cmp';
        actionText = '🔍 So sánh';
      } else if (hlValues.includes('piv')) {
        actionBadgeClass = 'badge-cmp';
        actionText = '📌 Xét chốt';
      } else if (hlValues.includes('fnd')) {
        actionBadgeClass = 'badge-ok';
        actionText = '★ Tìm thấy';
      }
    }

    // 2. Định dạng dãy phần tử với ký hiệu <->
    let swp1 = -1, swp2 = -1;
    if (step.swappedPair) {
      swp1 = Math.min(step.swappedPair[0], step.swappedPair[1]);
      swp2 = Math.max(step.swappedPair[0], step.swappedPair[1]);
    } else if (step.highlights) {
      const activeIndices = Object.entries(step.highlights)
        .filter(([_, st]) => st === 'cmp' || st === 'swp' || st === 'err')
        .map(([k]) => Number(k))
        .sort((a, b) => a - b);
      if (activeIndices.length === 2 && Math.abs(activeIndices[0] - activeIndices[1]) === 1) {
        swp1 = activeIndices[0];
        swp2 = activeIndices[1];
      }
    }

    const itemTokens = [];
    for (let k = 0; k < arr.length; k++) {
      const val = arr[k].value;
      if (k === swp1 && swp2 === swp1 + 1) {
        itemTokens.push(`${val} <span class="arrow-mark">&lt;-&gt;</span>`);
      } else {
        itemTokens.push(String(val));
      }
    }
    const arrFormatted = `[ ${itemTokens.join('  ')} ]`;

    // 3. Câu giải thích
    const cleanMsg = (step.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    rowsHtml += `
      <tr>
        <td class="center"><strong>#${stepNum}</strong></td>
        <td><span class="badge ${actionBadgeClass}">${actionText}</span></td>
        <td><div class="array-rep">${arrFormatted}</div></td>
        <td class="msg-cell">${cleanMsg}</td>
      </tr>
    `;
  });

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Báo Cáo Chạy Tay - ${algoName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 14mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 10pt;
      line-height: 1.45;
      padding: 4px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-section {
      border-bottom: 2.5px solid #2563eb;
      padding-bottom: 10px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-left h1 {
      font-size: 16pt;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: -0.01em;
      margin-bottom: 3px;
    }
    .header-left p {
      font-size: 9pt;
      color: #64748b;
    }
    .header-right {
      text-align: right;
      font-size: 8.5pt;
      color: #64748b;
    }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 14px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px 20px;
      font-size: 9.5pt;
    }
    .meta-item {
      display: flex;
      gap: 6px;
    }
    .meta-label {
      color: #475569;
    }
    .meta-val {
      font-weight: 700;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      font-size: 9pt;
    }
    thead {
      display: table-header-group;
    }
    tr {
      page-break-inside: avoid;
    }
    th {
      background-color: #e2e8f0 !important;
      color: #1e293b;
      font-weight: 700;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border: 1px solid #94a3b8;
      padding: 7px 8px;
      text-align: left;
    }
    th.center, td.center {
      text-align: center;
    }
    td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      vertical-align: middle;
    }
    tbody tr:nth-child(even) {
      background-color: #f8fafc !important;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 700;
      white-space: nowrap;
    }
    .badge-init { background: #e0f2fe !important; color: #0369a1; border: 1px solid #bae6fd; }
    .badge-cmp { background: #fef3c7 !important; color: #b45309; border: 1px solid #fde68a; }
    .badge-swp { background: #fee2e2 !important; color: #b91c1c; border: 1px solid #fecaca; }
    .badge-ok { background: #dcfce7 !important; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-err { background: #ffe4e6 !important; color: #be123c; border: 1px solid #fecdd3; }
    .array-rep {
      font-family: Consolas, "JetBrains Mono", "Courier New", monospace;
      font-size: 9pt;
      font-weight: 700;
      color: #0f172a;
      background: #f1f5f9 !important;
      padding: 3px 6px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      display: inline-block;
      white-space: nowrap;
    }
    .arrow-mark {
      color: #dc2626;
      font-weight: 800;
      padding: 0 1px;
    }
    .msg-cell {
      line-height: 1.4;
      color: #334155;
    }
    .footer-note {
      margin-top: 18px;
      padding-top: 8px;
      border-top: 1px dashed #cbd5e1;
      font-size: 8pt;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header-section">
    <div class="header-left">
      <h1>BÁO CÁO MÔ PHỎNG CHẠY TAY (DRY-RUN TRACE REPORT)</h1>
      <p>DSA Visualizer – Hệ thống học tập & mô phỏng giải thuật trực quan</p>
    </div>
    <div class="header-right">
      <div>Thời gian xuất: <strong>${nowStr}</strong></div>
      <div>Trạng thái: <strong>${total} bước mô phỏng</strong></div>
    </div>
  </div>

  <div class="meta-box">
    <div class="meta-item">
      <span class="meta-label">Thuật toán:</span>
      <span class="meta-val">${algoName} (${group})</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Độ phức tạp thời gian:</span>
      <span class="meta-val">Xấu nhất: ${worst} | Tốt nhất: ${best}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Mảng đầu vào:</span>
      <span class="meta-val">[ ${initialArr} ]</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Bộ nhớ phụ:</span>
      <span class="meta-val">${space}</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="center" style="width: 46px;">Bước</th>
        <th style="width: 100px;">Thao tác</th>
        <th style="width: 250px;">Thực thi mảng (&lt;-&gt;)</th>
        <th>Giải thích chi tiết</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer-note">
    Tài liệu kết xuất tự động từ dự án DSA Visualizer. Định dạng tối ưu cho in ấn A4 và lưu tệp PDF báo cáo bài tập lớn.
  </div>
</body>
</html>`;
}

/**
 * Xuất toàn bộ bảng chạy tay ra tệp PDF bằng hộp thoại in ấn chuẩn của trình duyệt
 */
export function exportTraceToPDF(algo, steps = []) {
  if (!steps || steps.length === 0) return false;

  const htmlContent = generateTracePrintHTML(algo, steps);

  // Tạo một iframe ẩn ngoài màn hình để gọi lệnh in
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '1024px';
  iframe.style.height = '768px';
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.warn('Lỗi in qua iframe, thử mở cửa sổ in riêng:', err);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        }, 4000);
      }
    }, 300);

    return true;
  } catch (err) {
    console.error('Không thể xuất PDF:', err);
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
    return false;
  }
}
