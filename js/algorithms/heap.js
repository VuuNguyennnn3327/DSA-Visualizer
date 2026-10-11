/**
 * DSA Visualizer - Binary Heap & Heap Sort (js/algorithms/heap.js)
 * Cấu trúc Đống Nhị Phân (Binary Heap) & Thuật toán Sắp xếp Vun Đống (Heap Sort)
 */
import { cloneArray } from '../utils.js';

export default {
  id: 'heap',
  name: 'Binary Heap & Heap Sort',
  group: 'Cấu trúc Cây',
  type: 'tree',
  isTree: true,
  treeType: 'heap',
  description: 'Cây nhị phân gần hoàn chỉnh được biểu diễn trực tiếp trên mảng 1 chiều. Trong Max-Heap, khóa của node cha luôn LỚN HƠN HOẶC BẰNG các con (A[i] >= A[2i+1], A[2i+2]). Thuật toán Heap Sort liên tục hoán đổi gốc lớn nhất về cuối mảng và vun đống lại, đạt độ phức tạp O(n log n).',
  analogy: 'Tương tự giải đấu thể thao hoặc giải đấu loại trực tiếp: người chiến thắng mạnh nhất luôn đứng ở đỉnh bảng (Root), nhận cúp về đích và nhường vị trí cho các ứng viên tiếp theo tranh tài.',
  complexity: {
    worst: 'O(n log n)',
    best: 'O(n log n)',
    space: 'O(1) In-place',
    stable: false
  },
  pseudocode: [
    'function heapify(A, n, i):',
    '    largest = i; left = 2*i + 1; right = 2*i + 2',
    '    if left < n and A[left] > A[largest]: largest = left',
    '    if right < n and A[right] > A[largest]: largest = right',
    '    if largest != i: swap(A[i], A[largest]); heapify(A, n, largest)',
    'function heapSort(A):',
    '    // Bước 1: Xây dựng Max-Heap ban đầu O(n)',
    '    for i = n/2 - 1 down to 0: heapify(A, n, i)',
    '    // Bước 2: Trích xuất từng phần tử lớn nhất O(n log n)',
    '    for i = n - 1 down to 1: swap(A[0], A[i]); heapify(A, i, 0)'
  ],
  inputRule: { min: 5, max: 99, sorted: false },

  /**
   * Sinh các bước mô phỏng: Xây dựng Max-Heap -> Heap Sort
   */
  run(initialArray = [], options = {}) {
    const arr = cloneArray(initialArray.length >= 5 ? initialArray.slice(0, 7) : [
      { id: 'h-0', value: 35 },
      { id: 'h-1', value: 12 },
      { id: 'h-2', value: 89 },
      { id: 'h-3', value: 44 },
      { id: 'h-4', value: 67 },
      { id: 'h-5', value: 23 },
      { id: 'h-6', value: 78 }
    ]);
    const n = arr.length;
    const steps = [];

    // Helper: Chuyển đổi mảng 1D sang cấu trúc cây nhị phân hoàn chỉnh
    function arrayToBinaryTree(arrayData, heapLimit = n) {
      function buildSubtree(i) {
        if (i >= heapLimit) return null;
        return {
          id: arrayData[i].id,
          val: arrayData[i].value,
          index: i,
          left: buildSubtree(2 * i + 1),
          right: buildSubtree(2 * i + 2)
        };
      }
      return buildSubtree(0);
    }

    // Bước 0: Mảng ban đầu
    steps.push({
      treeType: 'heap',
      root: arrayToBinaryTree(arr, n),
      array: cloneArray(arr),
      heapSize: n,
      activeAction: 'init',
      message: `Khởi tạo mảng gồm ${n} phần tử. Chuẩn bị biến đổi mảng thành Max-Heap: A[cha] >= A[con].`,
      codeLine: 7,
      isTree: true
    });

    // Hàm Heapify-down có ghi nhận bước
    function heapify(limit, i, phase = 'build') {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      steps.push({
        treeType: 'heap',
        root: arrayToBinaryTree(arr, limit),
        array: cloneArray(arr),
        heapSize: limit,
        activeAction: 'heapify_check',
        highlights: { [i]: 'cmp' },
        message: `Xét Node cha tại index ${i} (Giá trị ${arr[i].value}): Kiểm tra quan hệ với các con (Trái: ${left < limit ? arr[left].value : 'None'}, Phải: ${right < limit ? arr[right].value : 'None'}).`,
        codeLine: 2,
        isTree: true
      });

      if (left < limit && arr[left].value > arr[largest].value) {
        largest = left;
      }
      if (right < limit && arr[right].value > arr[largest].value) {
        largest = right;
      }

      if (largest !== i) {
        steps.push({
          treeType: 'heap',
          root: arrayToBinaryTree(arr, limit),
          array: cloneArray(arr),
          heapSize: limit,
          activeAction: 'heapify_swap_prepare',
          highlights: { [i]: 'swp', [largest]: 'swp' },
          message: `Vi phạm tính chất Max-Heap: Node con tại index ${largest} (${arr[largest].value}) > Node cha (${arr[i].value}). Hoán đổi 2 vị trí!`,
          codeLine: 5,
          isTree: true
        });

        // Hoán đổi
        const temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;

        steps.push({
          treeType: 'heap',
          root: arrayToBinaryTree(arr, limit),
          array: cloneArray(arr),
          heapSize: limit,
          activeAction: 'heapify_swap_done',
          highlights: { [i]: 'ok', [largest]: 'swp' },
          message: `Đã đổi chỗ xong! Vun đống tiếp tục xuống nhánh con index ${largest}...`,
          codeLine: 5,
          isTree: true
        });

        heapify(limit, largest, phase);
      }
    }

    // GIAI ĐOẠN 1: Xây dựng Max-Heap ban đầu
    steps.push({
      treeType: 'heap',
      root: arrayToBinaryTree(arr, n),
      array: cloneArray(arr),
      heapSize: n,
      activeAction: 'phase_build',
      message: '--- GIAI ĐOẠN 1: XÂY DỰNG MAX-HEAP (BUILD HEAP) --- Duyệt từ node không phải lá cuối cùng (n/2 - 1) ngược về Root.',
      codeLine: 7,
      isTree: true
    });

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i, 'build');
    }

    steps.push({
      treeType: 'heap',
      root: arrayToBinaryTree(arr, n),
      array: cloneArray(arr),
      heapSize: n,
      activeAction: 'build_complete',
      message: `✓ Hoàn thành xây dựng Max-Heap! Phần tử lớn nhất hiện tại (${arr[0].value}) đã nằm tại đỉnh Root.`,
      codeLine: 7,
      isTree: true
    });

    // GIAI ĐOẠN 2: Trích xuất và sắp xếp Heap Sort
    steps.push({
      treeType: 'heap',
      root: arrayToBinaryTree(arr, n),
      array: cloneArray(arr),
      heapSize: n,
      activeAction: 'phase_sort',
      message: '--- GIAI ĐOẠN 2: HEAP SORT --- Lần lượt tráo Root về cuối mảng và thu hẹp kích thước Heap.',
      codeLine: 9,
      isTree: true
    });

    for (let i = n - 1; i > 0; i--) {
      steps.push({
        treeType: 'heap',
        root: arrayToBinaryTree(arr, i + 1),
        array: cloneArray(arr),
        heapSize: i + 1,
        activeAction: 'sort_swap_prepare',
        highlights: { 0: 'swp', [i]: 'swp' },
        message: `Tráo phần tử lớn nhất tại Root (A[0] = ${arr[0].value}) về vị trí cuối A[${i}]. Kích thước Heap giảm xuống ${i}.`,
        codeLine: 9,
        isTree: true
      });

      const temp = arr[0];
      arr[0] = arr[i];
      arr[i] = temp;

      steps.push({
        treeType: 'heap',
        root: arrayToBinaryTree(arr, i),
        array: cloneArray(arr),
        heapSize: i,
        activeAction: 'sort_swap_done',
        highlights: { [i]: 'ok' },
        message: `Đã cố định phần tử ${arr[i].value} ở cuối! Vun đống lại Root với heapSize = ${i}...`,
        codeLine: 9,
        isTree: true
      });

      heapify(i, 0, 'sort');
    }

    // Bước hoàn tất
    steps.push({
      treeType: 'heap',
      root: arrayToBinaryTree(arr, 1),
      array: cloneArray(arr),
      heapSize: 0,
      activeAction: 'complete',
      message: `🎉 Hoàn tất Heap Sort! Toàn bộ mảng đã được sắp xếp tăng dần: [ ${arr.map(x => x.value).join(', ')} ].`,
      codeLine: 9,
      isComplete: true,
      isTree: true
    });

    return steps;
  }
};
