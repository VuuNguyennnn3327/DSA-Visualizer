/**
 * DSA Visualizer - Doubly Linked List (js/algorithms/doublyLinkedList.js)
 * Cấu trúc Dữ liệu Danh Sách Liên Kết Đôi / Kép (Doubly Linked List)
 */

export default {
  id: 'doublyLinkedList',
  name: 'Doubly Linked List (DSLK Đôi)',
  group: 'Cấu trúc Tuyến tính',
  type: 'linear',
  isLinear: true,
  linearType: 'doublyLinkedList',
  description: 'Cấu trúc dữ liệu tuyến tính trong đó mỗi Node gồm 3 thành phần: con trỏ prev trỏ về Node liền trước, dữ liệu (Data), và con trỏ next trỏ tới Node liền sau. Danh sách có thể duyệt 2 chiều (xuôi và ngược) với chi phí O(1) tại cả 2 đầu Head và Tail.',
  analogy: 'Tương tự đoàn tàu 2 đầu kéo: hành khách có thể di chuyển tiến về toa sau qua cửa Next hoặc lùi về toa trước qua cửa Prev một cách dễ dàng mà không cần quay đầu.',
  complexity: {
    worst: 'O(1) Thêm/Xóa 2 đầu, O(n) Tìm kiếm/Chèn giữa',
    best: 'O(1) Thao tác tại Head hoặc Tail',
    space: 'O(n) - Tốn thêm bộ nhớ lưu con trỏ prev',
    stable: true
  },
  pseudocode: [
    'struct Node { int data; Node* prev; Node* next; }',
    'function insertHead(val):',
    '    newNode = new Node(val, NULL, head)',
    '    if head != NULL: head.prev = newNode',
    '    head = newNode; if tail == NULL: tail = newNode',
    'function insertTail(val):',
    '    newNode = new Node(val, tail, NULL)',
    '    if tail != NULL: tail.next = newNode',
    '    tail = newNode; if head == NULL: head = newNode',
    'function forwardTraversal():',
    '    curr = head; while curr != NULL: visit(curr); curr = curr.next',
    'function backwardTraversal():',
    '    curr = tail; while curr != NULL: visit(curr); curr = curr.prev',
    'function reverse():',
    '    curr = head; while curr != NULL:',
    '        swap(curr.prev, curr.next); head = curr; curr = curr.prev'
  ],
  inputRule: { min: 5, max: 99, sorted: false },

  /**
   * Tạo kịch bản mô phỏng từng bước sinh động cho DSLK Đôi
   * @param {Array} initialArray Mảng số ban đầu từ người dùng
   * @param {object} options
   */
  run(initialArray = [], options = {}) {
    const steps = [];
    const values = initialArray.length > 0
      ? initialArray.slice(0, 4).map(x => x.value)
      : [35, 62, 88];

    // Helper clone nodes
    const cloneNodes = (nodes) => nodes.map(n => ({ ...n }));

    let nodes = [];

    // Bước 0: Danh sách rỗng
    steps.push({
      linearType: 'doublyLinkedList',
      nodes: [],
      activeNodeId: null,
      pointers: { head: null, tail: null, curr: null },
      activeAction: 'init',
      message: 'Khởi tạo Danh sách liên kết đôi rỗng: Head = NULL, Tail = NULL. Chưa có Node nào.',
      codeLine: 1,
      isLinear: true
    });

    // Thao tác 1: Chèn node đầu tiên
    const val0 = values[0] || 35;
    const node0 = { id: 'node-0', value: val0, prevId: null, nextId: null };
    nodes.push(node0);
    steps.push({
      linearType: 'doublyLinkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: 'node-0',
      pointers: { head: 'node-0', tail: 'node-0' },
      activeAction: 'insert_head',
      message: `Tạo Node(${val0}) đầu tiên: prev = NULL, next = NULL. Thiết lập Head = Tail = Node(${val0}).`,
      codeLine: 4,
      isLinear: true
    });

    // Thao tác 2: Chèn thêm vào đầu (insertHead)
    const valHead = 18;
    const newHeadNode = { id: 'node-head-new', value: valHead, prevId: null, nextId: nodes[0].id };
    nodes[0].prevId = newHeadNode.id;
    nodes.unshift(newHeadNode);
    steps.push({
      linearType: 'doublyLinkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: 'node-head-new',
      pointers: { head: 'node-head-new', tail: nodes[nodes.length - 1].id },
      activeAction: 'insert_head',
      message: `insertHead(${valHead}): Tạo Node(${valHead}), nối next ➔ Node cũ, nối prev của Node cũ ⬅ Node(${valHead}). Head = Node(${valHead}).`,
      codeLine: 3,
      isLinear: true
    });

    // Thao tác 3: Chèn vào đuôi (insertTail)
    const valTail = values[1] || 74;
    const lastNode = nodes[nodes.length - 1];
    const newTailNode = { id: 'node-tail-new', value: valTail, prevId: lastNode.id, nextId: null };
    lastNode.nextId = newTailNode.id;
    nodes.push(newTailNode);
    steps.push({
      linearType: 'doublyLinkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: 'node-tail-new',
      pointers: { head: nodes[0].id, tail: 'node-tail-new' },
      activeAction: 'insert_tail',
      message: `insertTail(${valTail}): Tạo Node(${valTail}), nối next của Tail cũ ➔ Node mới, nối prev của Node mới ⬅ Tail cũ. Cập nhật Tail mới.`,
      codeLine: 8,
      isLinear: true
    });

    // Thao tác 4: Duyệt xuôi từ Head -> Tail (Forward Traversal)
    steps.push({
      linearType: 'doublyLinkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: nodes[0].id,
      pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id, curr: nodes[0].id },
      activeAction: 'traverse_forward',
      message: 'Bắt đầu Duyệt Xuôi (Forward): Khởi tạo con trỏ curr = Head (Node ' + nodes[0].value + ').',
      codeLine: 10,
      isLinear: true
    });

    for (let i = 1; i < nodes.length; i++) {
      steps.push({
        linearType: 'doublyLinkedList',
        nodes: cloneNodes(nodes),
        activeNodeId: nodes[i].id,
        pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id, curr: nodes[i].id },
        activeAction: 'traverse_forward',
        message: `Duyệt xuôi bước ${i + 1}: Di chuyển curr = curr.next ➔ Node(${nodes[i].value}).`,
        codeLine: 11,
        isLinear: true
      });
    }

    // Thao tác 5: Duyệt ngược từ Tail -> Head (Backward Traversal) - ĐỘC QUYỀN CỦA DSLK ĐÔI
    steps.push({
      linearType: 'doublyLinkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: nodes[nodes.length - 1].id,
      pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id, curr: nodes[nodes.length - 1].id },
      activeAction: 'traverse_backward',
      message: 'Bắt đầu Duyệt Ngược (Backward): Nhờ con trỏ prev, xuất phát từ curr = Tail (Node ' + nodes[nodes.length - 1].value + ') mà không cần duyệt lại từ đầu!',
      codeLine: 13,
      isLinear: true
    });

    for (let i = nodes.length - 2; i >= 0; i--) {
      steps.push({
        linearType: 'doublyLinkedList',
        nodes: cloneNodes(nodes),
        activeNodeId: nodes[i].id,
        pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id, curr: nodes[i].id },
        activeAction: 'traverse_backward',
        message: `Duyệt ngược bước tiếp theo: Di chuyển curr = curr.prev ⬅ Node(${nodes[i].value}).`,
        codeLine: 14,
        isLinear: true
      });
    }

    // Thao tác 6: Đảo ngược danh sách đôi (Reverse Doubly Linked List)
    steps.push({
      linearType: 'doublyLinkedList',
      nodes: cloneNodes(nodes),
      pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id, curr: nodes[0].id },
      activeAction: 'reverse_start',
      message: 'Bắt đầu thuật toán Đảo ngược DSLK Đôi: Duyệt từng node và hoán đổi cặp con trỏ prev và next (swap prev ⇄ next).',
      codeLine: 15,
      isLinear: true
    });

    // Thực hiện hoán đổi con trỏ của từng node
    nodes.forEach((node, idx) => {
      const temp = node.prevId;
      node.prevId = node.nextId;
      node.nextId = temp;

      steps.push({
        linearType: 'doublyLinkedList',
        nodes: cloneNodes(nodes),
        activeNodeId: node.id,
        pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id, curr: node.id },
        activeAction: 'reverse_swap',
        message: `Hoán đổi con trỏ tại Node(${node.value}): Đổi chỗ prev và next. Con trỏ tiến trở thành con trỏ lùi.`,
        codeLine: 16,
        isLinear: true
      });
    });

    // Đảo thứ tự mảng để hiển thị chuẩn Head -> Tail mới
    nodes.reverse();

    steps.push({
      linearType: 'doublyLinkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: nodes[0].id,
      pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id },
      activeAction: 'reverse_done',
      message: `Đảo ngược DSLK Đôi hoàn tất! Hoán đổi Head ⇄ Tail: Head mới là Node(${nodes[0].value}), Tail mới là Node(${nodes[nodes.length - 1].value}).`,
      codeLine: 17,
      isComplete: true,
      isLinear: true
    });

    return steps;
  }
};
