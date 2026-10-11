/**
 * DSA Visualizer - Algorithms Registry (js/algorithms/index.js)
 * Điểm tập trung đăng ký tất cả các thuật toán và cấu trúc dữ liệu.
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
import stack from './stack.js';
import queue from './queue.js';
import linkedList from './linkedList.js';
import bst from './bst.js';
import avlTree from './avlTree.js';
import heap from './heap.js';

// Danh sách tất cả thuật toán & cấu trúc dữ liệu được đăng ký
export const algorithms = [
  // Cấu trúc Dữ liệu Tuyến tính
  stack,
  queue,
  linkedList,

  // Cấu trúc Cây & Cấu trúc Phân cấp (Mới)
  bst,
  avlTree,
  heap,

  // Sắp xếp & Tìm kiếm
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

// Gán danh mục chuẩn 4 nhóm và Big-O ngắn gọn cho mỗi thuật toán
const algoCategoryMap = {
  stack: { group: 'Cấu trúc Tuyến tính', shortComplexity: 'O(1)' },
  queue: { group: 'Cấu trúc Tuyến tính', shortComplexity: 'O(1)' },
  linkedList: { group: 'Cấu trúc Tuyến tính', shortComplexity: 'O(1)' },
  bst: { group: 'Cấu trúc Cây (Tree)', shortComplexity: 'O(log n)' },
  avlTree: { group: 'Cấu trúc Cây (Tree)', shortComplexity: 'O(log n)' },
  heap: { group: 'Cấu trúc Cây (Tree)', shortComplexity: 'O(log n)' },
  bubble: { group: 'Thuật toán Sắp xếp (Sort)', shortComplexity: 'O(n²)' },
  selection: { group: 'Thuật toán Sắp xếp (Sort)', shortComplexity: 'O(n²)' },
  insertion: { group: 'Thuật toán Sắp xếp (Sort)', shortComplexity: 'O(n²)' },
  quick: { group: 'Thuật toán Sắp xếp (Sort)', shortComplexity: 'O(n log n)' },
  merge: { group: 'Thuật toán Sắp xếp (Sort)', shortComplexity: 'O(n log n)' },
  counting: { group: 'Thuật toán Sắp xếp (Sort)', shortComplexity: 'O(n+k)' },
  radix: { group: 'Thuật toán Sắp xếp (Sort)', shortComplexity: 'O(d·n)' },
  linear: { group: 'Thuật toán Tìm kiếm (Search)', shortComplexity: 'O(n)' },
  binary: { group: 'Thuật toán Tìm kiếm (Search)', shortComplexity: 'O(log n)' }
};

algorithms.forEach(algo => {
  if (algoCategoryMap[algo.id]) {
    algo.group = algoCategoryMap[algo.id].group;
    algo.shortComplexity = algoCategoryMap[algo.id].shortComplexity;
  }
});

// Thứ tự 4 nhóm hiển thị trên Sidebar chuẩn theo yêu cầu của người dùng:
// Cấu trúc Tuyến tính, Cấu trúc Cây (Tree), Thuật toán Sắp xếp (Sort), Thuật toán Tìm kiếm (Search)
export const GROUP_ORDER = [
  'Cấu trúc Tuyến tính',
  'Cấu trúc Cây (Tree)',
  'Thuật toán Sắp xếp (Sort)',
  'Thuật toán Tìm kiếm (Search)'
];

export const GROUP_META = {
  'Cấu trúc Tuyến tính': { id: 'linear', name: 'Cấu trúc Tuyến tính', icon: '📦', badge: '3' },
  'Cấu trúc Cây (Tree)': { id: 'tree', name: 'Cấu trúc Cây (Tree)', icon: '🌳', badge: '3' },
  'Thuật toán Sắp xếp (Sort)': { id: 'sort', name: 'Thuật toán Sắp xếp', icon: '🔄', badge: '7' },
  'Thuật toán Tìm kiếm (Search)': { id: 'search', name: 'Thuật toán Tìm kiếm', icon: '🔍', badge: '2' }
};

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
  stack: 'Quản lý lời gọi hàm (Call Stack), tính biểu thức Ba Lan ngược (RPN), hoàn tác (Undo/Redo), kiểm tra dấu ngoặc hợp lệ.',
  queue: 'Lập lịch tiến trình CPU (Round Robin), bộ đệm in ấn (Print Spooler), truyền thông điệp bất đồng bộ (Message Broker), duyệt cây/đồ thị BFS.',
  linkedList: 'Quản lý bộ nhớ động, triển khai Stack/Queue, hệ thống nghe nhạc (Playlist), danh sách các tệp gần đây.',
  bst: 'Hệ thống tệp tin phân cấp, cơ sở dữ liệu tra cứu chỉ mục, biểu diễn cây cú pháp trừu tượng (AST) trong trình biên dịch.',
  avlTree: 'Cơ sở dữ liệu yêu cầu tần suất tìm kiếm cực cao (read-intensive), hệ thống định tuyến mạng tốc độ cao.',
  heap: 'Hàng đợi ưu tiên (Priority Queue), thuật toán Dijkstra & Prim, lập lịch tiến trình khẩn cấp trong hệ điều hành, Heap Sort.',
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
