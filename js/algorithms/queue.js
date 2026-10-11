/**
 * DSA Visualizer - Queue Data Structure (js/algorithms/queue.js)
 * Cấu trúc Dữ liệu Hàng Đợi (FIFO - First In First Out)
 */

export default {
  id: 'queue',
  name: 'Queue (Hàng đợi)',
  group: 'Cấu trúc Tuyến tính',
  type: 'linear',
  isLinear: true,
  linearType: 'queue',
  description: 'Cấu trúc dữ liệu tuyến tính hoạt động theo nguyên lý FIFO (First In First Out - Vào trước ra trước). Phần tử thêm vào (Enqueue) tại đuôi (Rear) và phần tử lấy ra (Dequeue) tại đầu (Front).',
  analogy: 'Tương tự hàng người xếp hàng mua vé xem phim hoặc xe chờ qua trạm thu phí: người đến trước sẽ luôn được phục vụ và rời đi trước.',
  complexity: {
    worst: 'O(1) Enqueue/Dequeue',
    best: 'O(1) Enqueue/Dequeue',
    space: 'O(n)',
    stable: true
  },
  pseudocode: [
    'class Queue:',
    '    front = 0, rear = -1, count = 0, capacity = MAX',
    '    function enqueue(val):',
    '        if count == capacity: return Overflow_Error',
    '        rear = rear + 1; A[rear] = val; count = count + 1',
    '    function dequeue():',
    '        if count == 0: return Underflow_Error',
    '        val = A[front]; front = front + 1; count = count - 1',
    '        return val',
    '    function getFront():',
    '        if count == 0: return NULL',
    '        return A[front]'
  ],
  inputRule: { min: 5, max: 99, sorted: false },

  /**
   * Tạo kịch bản mô phỏng từng bước cho Queue
   * @param {Array} initialArray Mảng số ban đầu từ người dùng
   * @param {object} options
   */
  run(initialArray = [], options = {}) {
    const steps = [];
    const capacity = 8;
    const itemsToEnqueue = initialArray.length > 0 
      ? initialArray.slice(0, 5).map(x => x.value) 
      : [12, 35, 78, 44];

    let currentQueue = [];
    let frontIdx = 0;
    let rearIdx = -1;

    // Bước 0: Khởi tạo Hàng đợi rỗng
    steps.push({
      linearType: 'queue',
      queue: [],
      front: 0,
      rear: -1,
      capacity,
      activeAction: 'init',
      activeItem: null,
      message: `Khởi tạo Hàng đợi (Queue) rỗng với sức chứa ${capacity} phần tử. Front = 0, Rear = -1, Size = 0.`,
      codeLine: 2,
      isLinear: true
    });

    // Thao tác 1: Enqueue từng phần tử vào hàng đợi
    for (let i = 0; i < itemsToEnqueue.length; i++) {
      const val = itemsToEnqueue[i];
      steps.push({
        linearType: 'queue',
        queue: [...currentQueue],
        front: frontIdx,
        rear: rearIdx,
        capacity,
        activeAction: 'enqueue_prepare',
        activeItem: val,
        message: `Chuẩn bị đưa phần tử ${val} vào cuối Hàng đợi: enqueue(${val}).`,
        codeLine: 3,
        isLinear: true
      });

      rearIdx++;
      currentQueue.push({ value: val, id: `queue-item-${i}` });

      steps.push({
        linearType: 'queue',
        queue: [...currentQueue],
        front: frontIdx,
        rear: rearIdx,
        capacity,
        activeAction: 'enqueue_done',
        activeItem: val,
        message: `Đã enqueue(${val}) thành công! Cập nhật Rear = ${rearIdx}. Phần tử ${val} đã đứng vào cuối hàng.`,
        codeLine: 5,
        isLinear: true
      });
    }

    // Thao tác 2: Xem phần tử đầu hàng (Front)
    if (currentQueue.length > 0) {
      const frontVal = currentQueue[0].value;
      steps.push({
        linearType: 'queue',
        queue: [...currentQueue],
        front: frontIdx,
        rear: rearIdx,
        capacity,
        activeAction: 'peek',
        activeItem: frontVal,
        message: `Thao tác getFront(): Phần tử đang đứng đầu hàng đợi hiện tại là ${frontVal}.`,
        codeLine: 11,
        isLinear: true
      });
    }

    // Thao tác 3: Dequeue phần tử đầu hàng
    if (currentQueue.length > 0) {
      const dequeuedVal = currentQueue[0].value;
      steps.push({
        linearType: 'queue',
        queue: [...currentQueue],
        front: frontIdx,
        rear: rearIdx,
        capacity,
        activeAction: 'dequeue_prepare',
        activeItem: dequeuedVal,
        message: `Chuẩn bị lấy phần tử đầu hàng ra khỏi Queue: dequeue(). Phần tử sẽ rời đi là ${dequeuedVal}.`,
        codeLine: 6,
        isLinear: true
      });

      currentQueue.shift();
      steps.push({
        linearType: 'queue',
        queue: [...currentQueue],
        front: frontIdx,
        rear: currentQueue.length - 1,
        capacity,
        activeAction: 'dequeue_done',
        activeItem: dequeuedVal,
        message: `Đã dequeue() thành công phần tử ${dequeuedVal}! Hàng đợi còn lại ${currentQueue.length} phần tử.`,
        codeLine: 8,
        isLinear: true
      });
    }

    // Thao tác 4: Enqueue phần tử mới để chứng minh FIFO
    const specialVal = 95;
    steps.push({
      linearType: 'queue',
      queue: [...currentQueue],
      front: 0,
      rear: currentQueue.length - 1,
      capacity,
      activeAction: 'enqueue_prepare',
      activeItem: specialVal,
      message: `Đưa phần tử mới ${specialVal} vào hàng đợi: enqueue(${specialVal}).`,
      codeLine: 3,
      isLinear: true
    });

    currentQueue.push({ value: specialVal, id: 'queue-item-special' });
    steps.push({
      linearType: 'queue',
      queue: [...currentQueue],
      front: 0,
      rear: currentQueue.length - 1,
      capacity,
      activeAction: 'enqueue_done',
      activeItem: specialVal,
      message: `Hoàn tất enqueue(${specialVal})! Minh họa nguyên lý FIFO hoàn chỉnh: phần tử vào trước ra trước.`,
      codeLine: 5,
      isComplete: true,
      isLinear: true
    });

    return steps;
  }
};
