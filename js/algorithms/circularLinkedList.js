/**
 * DSA Visualizer - Circular Linked List (js/algorithms/circularLinkedList.js)
 * Cấu trúc Dữ liệu Danh Sách Liên Kết Vòng (Circular Linked List)
 */

export default {
  id: 'circularLinkedList',
  name: 'Circular Linked List (DSLK Vòng)',
  group: 'Cấu trúc Tuyến tính',
  type: 'linear',
  isLinear: true,
  linearType: 'circularLinkedList',
  description: 'Biến thể của Danh sách liên kết trong đó Node cuối cùng (Tail) không trỏ về NULL mà con trỏ next trỏ ngược lại chính Node đầu tiên (Head), tạo thành một vòng tròn khép kín vô tận.',
  analogy: 'Tương tự vòng quay ngựa gỗ hoặc trò chơi chuyền bóng vòng tròn: người cuối cùng chuyền lại bóng cho người đầu tiên, không có điểm kết thúc cụ thể.',
  complexity: {
    worst: 'O(1) Thêm đầu/cuối nếu giữ con trỏ Tail, O(n) Tìm kiếm',
    best: 'O(1) Thao tác tại Head/Tail',
    space: 'O(n)',
    stable: true
  },
  pseudocode: [
    'struct Node { int data; Node* next; }',
    'function insertHead(val):',
    '    newNode = new Node(val)',
    '    if head == NULL: head = tail = newNode; newNode.next = head',
    '    else: newNode.next = head; tail.next = newNode; head = newNode',
    'function insertTail(val):',
    '    newNode = new Node(val)',
    '    if tail == NULL: head = tail = newNode; newNode.next = head',
    '    else: tail.next = newNode; newNode.next = head; tail = newNode',
    'function roundRobinStep():',
    '    curr = curr.next // Lập lịch chuyển giao CPU lượt tiếp theo'
  ],
  inputRule: { min: 5, max: 99, sorted: false },

  /**
   * Tạo kịch bản mô phỏng từng bước cho DSLK Vòng
   */
  run(initialArray = [], options = {}) {
    const steps = [];
    const values = initialArray.length > 0
      ? initialArray.slice(0, 4).map(x => x.value)
      : [24, 50, 75];

    const cloneNodes = (nodes) => nodes.map(n => ({ ...n }));
    let nodes = [];

    // Bước 0: Danh sách rỗng
    steps.push({
      linearType: 'circularLinkedList',
      nodes: [],
      activeNodeId: null,
      pointers: { head: null, tail: null, curr: null },
      activeAction: 'init',
      message: 'Khởi tạo DSLK Vòng rỗng: Head = Tail = NULL. Chưa có Node nào.',
      codeLine: 1,
      isLinear: true
    });

    // Thao tác 1: Chèn node đầu tiên
    const val0 = values[0] || 24;
    const node0 = { id: 'cll-node-0', value: val0, nextId: 'cll-node-0' };
    nodes.push(node0);
    steps.push({
      linearType: 'circularLinkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: 'cll-node-0',
      pointers: { head: 'cll-node-0', tail: 'cll-node-0' },
      activeAction: 'insert_head',
      message: `Tạo Node(${val0}) đầu tiên: Vì là danh sách vòng, con trỏ next trỏ ngược lại chính nó (Node.next = Node). Head = Tail = Node(${val0}).`,
      codeLine: 4,
      isLinear: true
    });

    // Thao tác 2: Chèn thêm vào đầu (insertHead)
    const valHead = 15;
    const newHeadNode = { id: 'cll-node-head', value: valHead, nextId: nodes[0].id };
    nodes[nodes.length - 1].nextId = newHeadNode.id;
    nodes.unshift(newHeadNode);
    steps.push({
      linearType: 'circularLinkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: 'cll-node-head',
      pointers: { head: 'cll-node-head', tail: nodes[nodes.length - 1].id },
      activeAction: 'insert_head',
      message: `insertHead(${valHead}): Tạo Node(${valHead}), nối next ➔ Head cũ, Tail.next uốn vòng trỏ về Head mới. Cập nhật Head = Node(${valHead}).`,
      codeLine: 5,
      isLinear: true
    });

    // Thao tác 3: Chèn vào đuôi (insertTail)
    const valTail = values[1] || 82;
    const newTailNode = { id: 'cll-node-tail', value: valTail, nextId: nodes[0].id };
    nodes[nodes.length - 1].nextId = newTailNode.id;
    nodes.push(newTailNode);
    steps.push({
      linearType: 'circularLinkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: 'cll-node-tail',
      pointers: { head: nodes[0].id, tail: 'cll-node-tail' },
      activeAction: 'insert_tail',
      message: `insertTail(${valTail}): Tạo Node(${valTail}), nối Tail cũ ➔ Node mới, Node mới uốn vòng trỏ về Head. Cập nhật Tail mới.`,
      codeLine: 8,
      isLinear: true
    });

    // Thao tác 4: Mô phỏng Lập lịch luân phiên Round-Robin CPU 2 vòng
    const totalVisits = nodes.length * 2;
    for (let i = 0; i < totalVisits; i++) {
      const currIdx = i % nodes.length;
      const roundNum = Math.floor(i / nodes.length) + 1;
      const isLoopBack = currIdx === 0 && i > 0;

      steps.push({
        linearType: 'circularLinkedList',
        nodes: cloneNodes(nodes),
        activeNodeId: nodes[currIdx].id,
        pointers: {
          head: nodes[0].id,
          tail: nodes[nodes.length - 1].id,
          curr: nodes[currIdx].id
        },
        activeAction: isLoopBack ? 'loop_back' : 'round_robin',
        message: isLoopBack
          ? `🔄 [Vòng ${roundNum}] Tail đã trỏ vòng ngược lại về Head! CPU tiếp tục chia Quantum cho Node(${nodes[currIdx].value}).`
          : `⚡ [Round-Robin Vòng ${roundNum}] CPU cấp phát thời gian thực thi cho Tiến trình Node(${nodes[currIdx].value}) tại [${currIdx}].`,
        codeLine: 10,
        isLinear: true
      });
    }

    steps.push({
      linearType: 'circularLinkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: nodes[0].id,
      pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id },
      activeAction: 'complete',
      message: '✓ Hoàn thành mô phỏng Lập lịch vòng lặp khép kín. DSLK Vòng không bao giờ gặp điểm NULL!',
      codeLine: 10,
      isComplete: true,
      isLinear: true
    });

    return steps;
  }
};
