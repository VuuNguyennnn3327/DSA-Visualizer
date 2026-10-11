/**
 * DSA Visualizer - Singly Linked List (js/algorithms/linkedList.js)
 * Cấu trúc Dữ liệu Danh Sách Liên Kết Đơn (Singly Linked List)
 */

export default {
  id: 'linkedList',
  name: 'Singly Linked List (DSLK Đơn)',
  group: 'Cấu trúc Tuyến tính',
  type: 'linear',
  isLinear: true,
  linearType: 'linkedList',
  description: 'Cấu trúc dữ liệu tuyến tính gồm các phần tử gọi là Node được lưu trữ rải rác trong bộ nhớ. Mỗi Node gồm 2 thành phần: Dữ liệu (Data) và Con trỏ (Next) trỏ đến địa chỉ của Node tiếp theo, node cuối cùng trỏ về NULL.',
  analogy: 'Tương tự như một đoàn tàu hỏa: mỗi toa tàu là một Node mang hàng hóa, được móc nối với toa phía sau bằng một khớp nối (con trỏ Next).',
  complexity: {
    worst: 'O(1) Thêm đầu / O(n) Thêm cuối, Tìm kiếm',
    best: 'O(1) Thao tác tại Head',
    space: 'O(n)',
    stable: true
  },
  pseudocode: [
    'struct Node { int data; Node* next; }',
    'function insertHead(val):',
    '    newNode = new Node(val, head)',
    '    head = newNode',
    'function insertTail(val):',
    '    newNode = new Node(val, NULL)',
    '    curr = head; while curr.next != NULL: curr = curr.next',
    '    curr.next = newNode',
    'function reverse():',
    '    prev = NULL, curr = head',
    '    while curr != NULL:',
    '        next = curr.next; curr.next = prev',
    '        prev = curr; curr = next',
    '    head = prev'
  ],
  inputRule: { min: 5, max: 99, sorted: false },

  /**
   * Tạo kịch bản mô phỏng từng bước sinh động cho DSLK Đơn
   * @param {Array} initialArray Mảng số ban đầu từ người dùng
   * @param {object} options
   */
  run(initialArray = [], options = {}) {
    const steps = [];
    const values = initialArray.length > 0
      ? initialArray.slice(0, 4).map(x => x.value)
      : [25, 42, 68];

    // Helper clone nodes
    const cloneNodes = (nodes) => nodes.map(n => ({ ...n }));

    let nodes = [];

    // Bước 0: Danh sách rỗng
    steps.push({
      linearType: 'linkedList',
      nodes: [],
      activeNodeId: null,
      pointers: { head: null, tail: null, curr: null, prev: null },
      activeAction: 'init',
      message: 'Khởi tạo Danh sách liên kết đơn rỗng: Head = NULL. Danh sách chưa có Node nào.',
      codeLine: 1,
      isLinear: true
    });

    // Thao tác 1: Chèn node đầu tiên (insertHead)
    const val0 = values[0] || 25;
    nodes.push({ id: 'node-0', value: val0, nextId: null });
    steps.push({
      linearType: 'linkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: 'node-0',
      pointers: { head: 'node-0', tail: 'node-0' },
      activeAction: 'insert_head',
      message: `Tạo Node(${val0}) đầu tiên. Cập nhật Head = Tail = Node(${val0}). Node trỏ tới NULL.`,
      codeLine: 3,
      isLinear: true
    });

    // Thao tác 2: Chèn thêm vào đầu (insertHead)
    const valHead = 12;
    const newHeadNode = { id: 'node-head-new', value: valHead, nextId: nodes[0].id };
    nodes.unshift(newHeadNode);
    steps.push({
      linearType: 'linkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: 'node-head-new',
      pointers: { head: 'node-head-new', tail: nodes[nodes.length - 1].id },
      activeAction: 'insert_head',
      message: `Thao tác insertHead(${valHead}): Tạo Node(${valHead}), nối con trỏ next tới Node cũ, cập nhật Head mới.`,
      codeLine: 4,
      isLinear: true
    });

    // Thao tác 3: Chèn vào đuôi (insertTail)
    const valTail = values[1] || 48;
    const newTailNode = { id: 'node-tail-new', value: valTail, nextId: null };
    nodes[nodes.length - 1].nextId = newTailNode.id;
    nodes.push(newTailNode);
    steps.push({
      linearType: 'linkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: 'node-tail-new',
      pointers: { head: nodes[0].id, tail: 'node-tail-new' },
      activeAction: 'insert_tail',
      message: `Thao tác insertTail(${valTail}): Duyệt đến đuôi hiện tại, nối con trỏ Next của đuôi cũ vào Node(${valTail}) mới.`,
      codeLine: 8,
      isLinear: true
    });

    // Thao tác 4: Tìm kiếm một giá trị trong danh sách (Search)
    const searchTarget = val0; // tìm node ở giữa
    steps.push({
      linearType: 'linkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: nodes[0].id,
      pointers: { head: nodes[0].id, curr: nodes[0].id },
      activeAction: 'search',
      message: `Bắt đầu tìm kiếm giá trị ${searchTarget}: Khởi tạo con trỏ curr = Head (Node ${nodes[0].value}). So sánh với ${searchTarget}...`,
      codeLine: 7,
      isLinear: true
    });

    // Duyệt qua node 0 (không khớp)
    if (nodes[0].value !== searchTarget && nodes[1]) {
      steps.push({
        linearType: 'linkedList',
        nodes: cloneNodes(nodes),
        activeNodeId: nodes[1].id,
        pointers: { head: nodes[0].id, curr: nodes[1].id },
        activeAction: 'search_found',
        message: `Dịch con trỏ curr sang Node kế tiếp: curr = curr.next (Node ${nodes[1].value}). Đã tìm thấy giá trị ${searchTarget}!`,
        codeLine: 7,
        isLinear: true
      });
    }

    // Thao tác 5: ĐẢO NGƯỢC DANH SÁCH LIÊN KẾT (Reverse Linked List) - Kinh điển!
    steps.push({
      linearType: 'linkedList',
      nodes: cloneNodes(nodes),
      pointers: { head: nodes[0].id, prev: null, curr: nodes[0].id },
      activeAction: 'reverse_start',
      message: 'Bắt đầu thuật toán Đảo ngược danh sách (Reverse): Khởi tạo con trỏ prev = NULL, curr = Head.',
      codeLine: 10,
      isLinear: true
    });

    let prevId = null;
    let currIdx = 0;
    while (currIdx < nodes.length) {
      const currNode = nodes[currIdx];
      const nextId = currNode.nextId;

      // Bước trỏ ngược lại
      currNode.nextId = prevId;

      steps.push({
        linearType: 'linkedList',
        nodes: cloneNodes(nodes),
        activeNodeId: currNode.id,
        pointers: {
          head: nodes[0].id,
          prev: currNode.id,
          curr: nextId ? nodes.find(n => n.id === nextId)?.id : null
        },
        activeAction: 'reverse_step',
        message: `Đổi chiều con trỏ: Node(${currNode.value}).next = prev (${prevId ? nodes.find(n => n.id === prevId)?.value : 'NULL'}). Dịch prev = curr.`,
        codeLine: 12,
        isLinear: true
      });

      prevId = currNode.id;
      currIdx++;
    }

    // Đảo mảng nodes hiển thị theo thứ tự mới
    nodes.reverse();

    steps.push({
      linearType: 'linkedList',
      nodes: cloneNodes(nodes),
      activeNodeId: nodes[0].id,
      pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id },
      activeAction: 'reverse_done',
      message: `Đảo ngược danh sách thành công! Cập nhật Head mới trỏ vào Node(${nodes[0].value}). Toàn bộ các con trỏ đã đảo chiều.`,
      codeLine: 14,
      isComplete: true,
      isLinear: true
    });

    return steps;
  }
};
