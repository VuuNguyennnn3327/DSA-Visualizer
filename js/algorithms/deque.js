/**
 * DSA Visualizer - Deque (Double-Ended Queue) (js/algorithms/deque.js)
 * Cấu trúc Dữ liệu Hàng Đợi Hai Đầu (Deque)
 */

export default {
  id: 'deque',
  name: 'Deque (Hàng Đợi Hai Đầu)',
  group: 'Cấu trúc Tuyến tính',
  type: 'linear',
  isLinear: true,
  linearType: 'deque',
  description: 'Hàng đợi hai đầu (Double-ended Queue) là cấu trúc tuyến tính mở rộng cho phép thực hiện cả 4 thao tác thêm và xóa phần tử ở cả 2 đầu: Đầu trước (Front) và Đầu sau (Rear) đều trong thời gian hằng số O(1).',
  analogy: 'Tương tự một toa tàu mở cửa cả 2 đầu: hành khách có thể lên hoặc xuống ở cả cửa trước lẫn cửa sau một cách tự do.',
  complexity: {
    worst: 'O(1) Thêm/Xóa ở cả Front và Rear',
    best: 'O(1) Mọi thao tác 2 đầu',
    space: 'O(n)',
    stable: true
  },
  pseudocode: [
    'class Deque {',
    '    pushFront(x): thêm phần tử vào đầu Front (O(1))',
    '    pushBack(x):  thêm phần tử vào đuôi Rear (O(1))',
    '    popFront():   lấy và xóa phần tử ở đầu Front (O(1))',
    '    popBack():    lấy và xóa phần tử ở đuôi Rear (O(1))',
    '    checkPalindrome(str): so sánh đồng thời ký tự popFront() và popBack()',
    '}'
  ],
  inputRule: { min: 5, max: 99, sorted: false },

  /**
   * Tạo kịch bản mô phỏng sinh động cho Deque
   */
  run(initialArray = [], options = {}) {
    const steps = [];
    const values = initialArray.length > 0
      ? initialArray.slice(0, 4).map(x => x.value)
      : [30, 45, 70];

    const deque = [];

    // Bước 0: Deque rỗng
    steps.push({
      linearType: 'deque',
      deque: [],
      capacity: 8,
      activeAction: 'init',
      message: 'Khởi tạo Hàng đợi hai đầu (Deque) rỗng: Size = 0, Capacity = 8.',
      codeLine: 1,
      isLinear: true
    });

    // Thao tác 1: pushBack
    const val0 = values[0] || 30;
    deque.push({ id: 'deque-0', value: val0 });
    steps.push({
      linearType: 'deque',
      deque: [...deque],
      capacity: 8,
      activeAction: 'push_back',
      activeItem: val0,
      activeEnds: ['rear'],
      message: `Thao tác pushBack(${val0}): Đẩy ${val0} vào đầu sau (Rear). Size = ${deque.length}.`,
      codeLine: 3,
      isLinear: true
    });

    // Thao tác 2: pushFront
    const valFront1 = 18;
    deque.unshift({ id: 'deque-front-1', value: valFront1 });
    steps.push({
      linearType: 'deque',
      deque: [...deque],
      capacity: 8,
      activeAction: 'push_front',
      activeItem: valFront1,
      activeEnds: ['front'],
      message: `Thao tác pushFront(${valFront1}): Đẩy ${valFront1} vào đầu trước (Front). Size = ${deque.length}.`,
      codeLine: 2,
      isLinear: true
    });

    // Thao tác 3: pushBack
    const valRear2 = values[1] || 65;
    deque.push({ id: 'deque-rear-2', value: valRear2 });
    steps.push({
      linearType: 'deque',
      deque: [...deque],
      capacity: 8,
      activeAction: 'push_back',
      activeItem: valRear2,
      activeEnds: ['rear'],
      message: `Thao tác pushBack(${valRear2}): Đẩy thêm ${valRear2} vào Rear. Size = ${deque.length}.`,
      codeLine: 3,
      isLinear: true
    });

    // Thao tác 4: pushFront
    const valFront2 = 12;
    deque.unshift({ id: 'deque-front-2', value: valFront2 });
    steps.push({
      linearType: 'deque',
      deque: [...deque],
      capacity: 8,
      activeAction: 'push_front',
      activeItem: valFront2,
      activeEnds: ['front'],
      message: `Thao tác pushFront(${valFront2}): Đẩy ${valFront2} vào Front. Hàng đợi hiện có ${deque.length} phần tử.`,
      codeLine: 2,
      isLinear: true
    });

    // Thao tác 5: popFront
    const poppedFront = deque.shift();
    steps.push({
      linearType: 'deque',
      deque: [...deque],
      capacity: 8,
      activeAction: 'pop_front',
      activeItem: poppedFront.value,
      activeEnds: ['front'],
      message: `Thao tác popFront(): Lấy ra phần tử đầu trước ${poppedFront.value} trong O(1).`,
      codeLine: 4,
      isLinear: true
    });

    // Thao tác 6: popBack
    const poppedRear = deque.pop();
    steps.push({
      linearType: 'deque',
      deque: [...deque],
      capacity: 8,
      activeAction: 'pop_back',
      activeItem: poppedRear.value,
      activeEnds: ['rear'],
      message: `Thao tác popBack(): Lấy ra phần tử đuôi sau ${poppedRear.value} trong O(1).`,
      codeLine: 5,
      isLinear: true
    });

    steps.push({
      linearType: 'deque',
      deque: [...deque],
      capacity: 8,
      activeAction: 'complete',
      message: `✓ Hoàn thành kịch bản Deque: Còn lại ${deque.length} phần tử trong ống hai đầu.`,
      codeLine: 1,
      isComplete: true,
      isLinear: true
    });

    return steps;
  }
};
