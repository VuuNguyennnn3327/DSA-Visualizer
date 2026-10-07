/**
 * DSA Visualizer - Algorithms Registry (js/algorithms/index.js)
 * Điểm tập trung đăng ký tất cả 9 thuật toán và gom nhóm theo độ phức tạp / loại.
 * Để thêm thuật toán mới, chỉ cần import file mới vào đây và đưa vào danh sách algorithms.
 */

import bubble from './bubble.js';
import selection from './selection.js';
import insertion from './insertion.js';
import quick from './quick.js';
import merge from './merge.js';
import counting from './counting.js';
import radix from './radix.js';
import linear from './linear.js';
import binary from './binary.js';

// Danh sách tất cả thuật toán được đăng ký
export const algorithms = [
  bubble,
  selection,
  insertion,
  quick,
  merge,
  counting,
  radix,
  linear,
  binary
];

// Thứ tự các nhóm hiển thị trên Sidebar
export const GROUP_ORDER = [
  'Sắp xếp O(n²)',
  'Sắp xếp O(n log n)',
  'Sắp xếp không so sánh',
  'Tìm kiếm'
];

// Nhóm các thuật toán theo nhóm
export const algorithmsByGroup = GROUP_ORDER.reduce((acc, groupName) => {
  acc[groupName] = algorithms.filter(algo => algo.group === groupName);
  return acc;
}, {});

/**
 * Tìm kiếm thuật toán theo mã định danh (id)
 * @param {string} id 
 * @returns {object|undefined}
 */
export function getAlgorithmById(id) {
  return algorithms.find(algo => algo.id === id);
}

// Bổ sung mô tả ứng dụng thực tế cho Bảng so sánh Tổng quan
export const algorithmUseCases = {
  bubble: 'Mục đích học tập, trực quan hóa nhập môn hoặc kiểm tra mảng đã có thứ tự.',
  selection: 'Khi chi phí ghi bộ nhớ (ghi đĩa/flash) đắt đỏ và cần hạn chế tối đa số lần hoán đổi (tối đa n lần đổi chỗ).',
  insertion: 'Rất nhanh và hiệu quả cho mảng nhỏ (n < 20) hoặc mảng gần như đã sắp xếp.',
  quick: 'Lựa chọn tiêu chuẩn đa mục đích cho sắp xếp trong bộ nhớ RAM với tốc độ trung bình vượt trội.',
  merge: 'Khi cần đảm bảo tính ổn định (stable) hoặc sắp xếp danh sách liên kết / dữ liệu ngoại vi lớn.',
  counting: 'Khi khoảng giá trị các phần tử k nhỏ (ví dụ điểm thi 0-100, nhóm tuổi).',
  radix: 'Khi các phần tử là số nguyên hoặc chuỗi ký tự có độ dài chữ số cố định.',
  linear: 'Mảng chưa được sắp xếp, dữ liệu kích thước nhỏ hoặc danh sách liên kết đơn.',
  binary: 'Dữ liệu đã sắp xếp sẵn, cần tốc độ tìm kiếm cực nhanh trên tập dữ liệu lớn.'
};
