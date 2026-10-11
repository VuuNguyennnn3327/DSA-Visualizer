/**
 * DSA Visualizer - Stack Data Structure (js/algorithms/stack.js)
 * Cấu trúc Dữ liệu Ngăn Xếp (LIFO - Last In First Out)
 */

export default {
  id: 'stack',
  name: 'Stack (Ngăn xếp)',
  group: 'Cấu trúc Tuyến tính',
  type: 'linear',
  isLinear: true,
  linearType: 'stack',
  description: 'Cấu trúc dữ liệu tuyến tính hoạt động theo nguyên lý LIFO (Last In First Out - Vào sau ra trước). Mọi thao tác thêm (Push) và lấy ra (Pop) đều chỉ diễn ra tại một đầu duy nhất gọi là Đỉnh (Top).',
  analogy: 'Tương tự như một chồng đĩa ăn hoặc hộp cầu lông: chiếc đĩa được đặt vào sau cùng sẽ luôn là chiếc đĩa đầu tiên được nhấc ra.',
  complexity: {
    worst: 'O(1) Push/Pop',
    best: 'O(1) Push/Pop',
    space: 'O(n)',
    stable: true
  },
  pseudocode: [
    'class Stack:',
    '    top = -1, capacity = MAX',
    '    function push(val):',
    '        if top == capacity - 1: return Overflow_Error',
    '        top = top + 1; A[top] = val',
    '    function pop():',
    '        if top == -1: return Underflow_Error',
    '        val = A[top]; top = top - 1; return val',
    '    function peek():',
    '        if top == -1: return NULL',
    '        return A[top]'
  ],
  inputRule: { min: 5, max: 99, sorted: false },

  /**
   * Tạo kịch bản mô phỏng từng bước cho Stack
   * @param {Array} initialArray Mảng số ban đầu từ người dùng
   * @param {object} options
   */
  run(initialArray = [], options = {}) {
    const steps = [];
    const capacity = 8;
    const itemsToPush = initialArray.length > 0 
      ? initialArray.slice(0, 5).map(x => x.value) 
      : [15, 32, 68, 45];

    let currentStack = [];

    // Bước 0: Khởi tạo Stack rỗng
    steps.push({
      linearType: 'stack',
      stack: [],
      top: -1,
      capacity,
      activeAction: 'init',
      activeItem: null,
      message: `Khởi tạo Ngăn xếp (Stack) rỗng với sức chứa tối đa ${capacity} phần tử. Con trỏ Top = -1.`,
      codeLine: 2,
      isLinear: true
    });

    // Thao tác 1: Push từng phần tử vào stack
    for (let i = 0; i < itemsToPush.length; i++) {
      const val = itemsToPush[i];
      // Bước chuẩn bị push
      steps.push({
        linearType: 'stack',
        stack: [...currentStack],
        top: currentStack.length - 1,
        capacity,
        activeAction: 'push_prepare',
        activeItem: val,
        message: `Chuẩn bị đẩy phần tử ${val} vào đỉnh Stack: push(${val}).`,
        codeLine: 3,
        isLinear: true
      });

      // Thực thi push
      currentStack.push({ value: val, id: `stack-item-${i}` });
      steps.push({
        linearType: 'stack',
        stack: [...currentStack],
        top: currentStack.length - 1,
        capacity,
        activeAction: 'push_done',
        activeItem: val,
        message: `Đã push(${val}) thành công! Cập nhật Top = ${currentStack.length - 1}. Phần tử ${val} hiện ở đỉnh Stack.`,
        codeLine: 5,
        isLinear: true
      });
    }

    // Thao tác 2: Peek đỉnh stack
    if (currentStack.length > 0) {
      const topVal = currentStack[currentStack.length - 1].value;
      steps.push({
        linearType: 'stack',
        stack: [...currentStack],
        top: currentStack.length - 1,
        capacity,
        activeAction: 'peek',
        activeItem: topVal,
        message: `Thao tác peek(): Xem giá trị ở đỉnh Stack hiện tại là ${topVal} (không xóa phần tử khỏi Stack).`,
        codeLine: 9,
        isLinear: true
      });
    }

    // Thao tác 3: Pop phần tử ở đỉnh
    if (currentStack.length > 0) {
      const popped = currentStack[currentStack.length - 1].value;
      steps.push({
        linearType: 'stack',
        stack: [...currentStack],
        top: currentStack.length - 1,
        capacity,
        activeAction: 'pop_prepare',
        activeItem: popped,
        message: `Chuẩn bị lấy phần tử ở đỉnh ra khỏi Stack: pop(). Phần tử được lấy ra là ${popped}.`,
        codeLine: 6,
        isLinear: true
      });

      currentStack.pop();
      steps.push({
        linearType: 'stack',
        stack: [...currentStack],
        top: currentStack.length - 1,
        capacity,
        activeAction: 'pop_done',
        activeItem: popped,
        message: `Đã pop() thành công phần tử ${popped}! Con trỏ Top lùi về ${currentStack.length - 1}.`,
        codeLine: 8,
        isLinear: true
      });
    }

    // Thao tác 4: Push thêm một phần tử đặc biệt để minh họa LIFO
    const specialVal = 99;
    steps.push({
      linearType: 'stack',
      stack: [...currentStack],
      top: currentStack.length - 1,
      capacity,
      activeAction: 'push_prepare',
      activeItem: specialVal,
      message: `Đẩy phần tử mới ${specialVal} vào Stack: push(${specialVal}).`,
      codeLine: 3,
      isLinear: true
    });

    currentStack.push({ value: specialVal, id: `stack-item-special` });
    steps.push({
      linearType: 'stack',
      stack: [...currentStack],
      top: currentStack.length - 1,
      capacity,
      activeAction: 'push_done',
      activeItem: specialVal,
      message: `Hoàn tất push(${specialVal})! Stack hiện chứa ${currentStack.length} phần tử. Thao tác LIFO hoàn chỉnh.`,
      codeLine: 5,
      isComplete: true,
      isLinear: true
    });

    return steps;
  }
};
