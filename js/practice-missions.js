/**
 * DSA Visualizer - Practice Missions (js/practice-missions.js)
 * Danh sách nhiệm vụ thực hành có hướng dẫn từng bước cho các cấu trúc dữ liệu và giải thuật mới:
 * Singly Linked List, Stack, Queue, BST, AVL Tree, Heap, Linear & Binary Search.
 */

export const PRACTICE_MISSIONS = {
  linkedList: {
    title: 'Singly Linked List (DSLK Đơn)',
    tasks: [
      {
        id: 'insert_head',
        label: '➕ Thêm đầu',
        desc: 'Thêm một Node mới vào đầu danh sách (Head)',
        hint: 'Nhập số vào ô Giá trị (vd: 25) và bấm nút [➕ Thêm đầu] (Chi phí O(1))',
        buttonId: 'btn-linear-insert-head'
      },
      {
        id: 'insert_tail',
        label: '➕ Thêm đuôi',
        desc: 'Thêm một Node mới vào đuôi danh sách (Tail)',
        hint: 'Nhập số vào ô Giá trị (vd: 60) và bấm nút [➕ Thêm đuôi] (Chi phí O(n))',
        buttonId: 'btn-linear-insert-tail'
      },
      {
        id: 'search',
        label: '🔍 Tìm kiếm',
        desc: 'Tìm kiếm một giá trị trong danh sách liên kết',
        hint: 'Nhập số cần tìm vào ô Giá trị và bấm nút [🔍 Tìm(x)]',
        buttonId: 'btn-linear-search'
      },
      {
        id: 'reverse',
        label: '🔄 Đảo ngược',
        desc: 'Đảo ngược toàn bộ chiều liên kết trong danh sách',
        hint: 'Bấm nút [🔄 Đảo ngược] để đảo chiều các con trỏ Next O(n)',
        buttonId: 'btn-linear-reverse'
      }
    ]
  },

  doublyLinkedList: {
    title: 'Doubly Linked List (DSLK Đôi)',
    tasks: [
      {
        id: 'insert_head',
        label: '➕ Thêm đầu',
        desc: 'Thêm một Node mới vào đầu danh sách (Head)',
        hint: 'Nhập số vào ô Giá trị và bấm nút [➕ Thêm đầu] (Chi phí O(1))',
        buttonId: 'btn-dll-insert-head'
      },
      {
        id: 'insert_tail',
        label: '➕ Thêm đuôi',
        desc: 'Thêm một Node mới vào đuôi danh sách (Tail)',
        hint: 'Nhập số vào ô Giá trị và bấm nút [➕ Thêm đuôi] (Chi phí O(1) trực tiếp)',
        buttonId: 'btn-dll-insert-tail'
      },
      {
        id: 'traverse_forward',
        label: '➡️ Duyệt xuôi',
        desc: 'Duyệt xuôi từ Head sang Tail qua con trỏ next',
        hint: 'Bấm nút [➡️ Duyệt xuôi] để di chuyển theo chiều tiến',
        buttonId: 'btn-dll-traverse-fwd'
      },
      {
        id: 'traverse_backward',
        label: '⬅️ Duyệt ngược',
        desc: 'Duyệt ngược từ Tail về Head qua con trỏ prev',
        hint: 'Bấm nút [⬅️ Duyệt ngược] - Tính năng độc quyền của DSLK Đôi',
        buttonId: 'btn-dll-traverse-bwd'
      },
      {
        id: 'reverse',
        label: '🔄 Đảo ngược',
        desc: 'Đảo ngược toàn bộ DSLK Đôi bằng cách swap(prev, next)',
        hint: 'Bấm nút [🔄 Đảo ngược] để hoán đổi cặp con trỏ của từng Node',
        buttonId: 'btn-dll-reverse'
      }
    ]
  },

  circularLinkedList: {
    title: 'Circular Linked List (DSLK Vòng)',
    tasks: [
      {
        id: 'insert_head',
        label: '➕ Thêm đầu',
        desc: 'Thêm node mới vào đầu và uốn vòng Tail.next trỏ về Head',
        hint: 'Bấm nút [➕ Thêm đầu]',
        buttonId: 'btn-cll-insert-head'
      },
      {
        id: 'insert_tail',
        label: '➕ Thêm đuôi',
        desc: 'Thêm node mới vào đuôi và uốn vòng về Head',
        hint: 'Bấm nút [➕ Thêm đuôi]',
        buttonId: 'btn-cll-insert-tail'
      },
      {
        id: 'round_robin',
        label: '⚡ Round-Robin',
        desc: 'Thực thi 1 lượt CPU Quantum xoay vòng',
        hint: 'Bấm nút [⚡ Round-Robin(1 lượt)]',
        buttonId: 'btn-cll-round-robin'
      }
    ]
  },

  deque: {
    title: 'Deque (Hàng Đợi Hai Đầu)',
    tasks: [
      {
        id: 'push_front',
        label: '📥 Push Front',
        desc: 'Đẩy một phần tử vào đầu trước của Deque',
        hint: 'Bấm nút [📥 Push Front]',
        buttonId: 'btn-deque-push-front'
      },
      {
        id: 'push_back',
        label: '📥 Push Back',
        desc: 'Đẩy một phần tử vào đuôi sau của Deque',
        hint: 'Bấm nút [📥 Push Back]',
        buttonId: 'btn-deque-push-back'
      },
      {
        id: 'pop_front',
        label: '📤 Pop Front',
        desc: 'Lấy phần tử ra từ đầu trước',
        hint: 'Bấm nút [📤 Pop Front]',
        buttonId: 'btn-deque-pop-front'
      },
      {
        id: 'pop_back',
        label: '📤 Pop Back',
        desc: 'Lấy phần tử ra từ đuôi sau',
        hint: 'Bấm nút [📤 Pop Back]',
        buttonId: 'btn-deque-pop-back'
      }
    ]
  },

  stack: {
    title: 'Ngăn Xếp (Stack)',
    tasks: [
      {
        id: 'push',
        label: '📥 Push(x)',
        desc: 'Đẩy phần tử thứ nhất vào đỉnh ngăn xếp',
        hint: 'Nhập một số và bấm nút [📥 Push(x)]',
        buttonId: 'btn-linear-push'
      },
      {
        id: 'push',
        label: '📥 Push(x)',
        desc: 'Đẩy tiếp phần tử thứ hai vào đỉnh ngăn xếp',
        hint: 'Bấm nút [📥 Push(x)] lần nữa để đẩy thêm số vào đỉnh Stack',
        buttonId: 'btn-linear-push'
      },
      {
        id: 'peek',
        label: '👁 Peek()',
        desc: 'Xem giá trị phần tử ở đỉnh Top',
        hint: 'Bấm nút [👁 Peek()] để đọc giá trị đỉnh mà không xóa',
        buttonId: 'btn-linear-peek'
      },
      {
        id: 'pop',
        label: '📤 Pop()',
        desc: 'Lấy phần tử trên đỉnh ra khỏi ngăn xếp (LIFO)',
        hint: 'Bấm nút [📤 Pop()] để rút phần tử ở đỉnh ra khỏi ngăn xếp',
        buttonId: 'btn-linear-pop'
      }
    ]
  },

  queue: {
    title: 'Hàng Đợi (Queue)',
    tasks: [
      {
        id: 'enqueue',
        label: '📥 Enqueue(x)',
        desc: 'Thêm phần tử thứ nhất vào đuôi hàng đợi (Rear)',
        hint: 'Nhập một số và bấm nút [📥 Enqueue(x)]',
        buttonId: 'btn-linear-enqueue'
      },
      {
        id: 'enqueue',
        label: '📥 Enqueue(x)',
        desc: 'Thêm tiếp phần tử thứ hai vào đuôi hàng đợi',
        hint: 'Bấm nút [📥 Enqueue(x)] lần nữa để thêm phần tử vào hàng',
        buttonId: 'btn-linear-enqueue'
      },
      {
        id: 'front',
        label: '👁 GetFront()',
        desc: 'Xem phần tử đang đứng đầu hàng đợi (Front)',
        hint: 'Bấm nút [👁 GetFront()] để đọc phần tử đầu',
        buttonId: 'btn-linear-front'
      },
      {
        id: 'dequeue',
        label: '📤 Dequeue()',
        desc: 'Lấy phần tử đứng đầu ra khỏi hàng đợi (FIFO)',
        hint: 'Bấm nút [📤 Dequeue()] để đưa phần tử đầu ra khỏi hàng',
        buttonId: 'btn-linear-dequeue'
      }
    ]
  },

  bst: {
    title: 'Cây Nhị Phân Tìm Kiếm (BST)',
    tasks: [
      {
        id: 'insert',
        label: '➕ Chèn Node',
        desc: 'Chèn khóa gốc (Root) vào cây BST',
        hint: 'Nhập số (vd: 50) và bấm nút [➕ Chèn(x)]',
        buttonId: 'btn-tree-insert'
      },
      {
        id: 'insert',
        label: '➕ Chèn Node',
        desc: 'Chèn thêm khóa thứ hai vào cây BST',
        hint: 'Nhập số khác (vd: 25) và bấm nút [➕ Chèn(x)]',
        buttonId: 'btn-tree-insert'
      },
      {
        id: 'search',
        label: '🔍 Tìm kiếm',
        desc: 'Tìm kiếm một khóa trên cây BST',
        hint: 'Nhập số vừa chèn và bấm [🔍 Tìm(x)] để tìm kiếm O(h)',
        buttonId: 'btn-tree-search'
      },
      {
        id: 'inorder',
        label: '📖 Duyệt Inorder',
        desc: 'Duyệt Inorder (Trái - Gốc - Phải) thu dãy khóa tăng dần',
        hint: 'Bấm nút [📖 Duyệt Inorder] để duyệt cây theo thứ tự',
        buttonId: 'btn-tree-inorder'
      }
    ]
  },

  avlTree: {
    title: 'Cây Cân Bằng AVL',
    tasks: [
      {
        id: 'insert',
        label: '➕ Chèn khóa',
        desc: 'Chèn khóa vào cây AVL',
        hint: 'Nhập số và bấm nút [➕ Chèn(x)]',
        buttonId: 'btn-avl-insert'
      },
      {
        id: 'rotate',
        label: '🔄 Phép xoay',
        desc: 'Trải nghiệm phép xoay cân bằng cây AVL',
        hint: 'Bấm một trong các nút [⚡ Xoay LL] hoặc [⚡ Xoay RR] để quan sát xoay cây',
        buttonId: 'btn-avl-case-ll'
      },
      {
        id: 'search',
        label: '🔍 Tìm kiếm',
        desc: 'Tìm kiếm khóa trên cây AVL với tốc độ O(log n)',
        hint: 'Nhập số và bấm nút [🔍 Tìm(x)]',
        buttonId: 'btn-avl-search'
      }
    ]
  },

  heap: {
    title: 'Binary Max-Heap',
    tasks: [
      {
        id: 'push',
        label: '📥 Thêm(x)',
        desc: 'Thêm phần tử mới vào Heap và Sift-up',
        hint: 'Nhập số (vd: 95) và bấm [📥 Thêm(x)] để quan sát nổi lên đỉnh',
        buttonId: 'btn-heap-push'
      },
      {
        id: 'extract',
        label: '⚡ Rút Max()',
        desc: 'Rút phần tử lớn nhất ở đỉnh Heap (Root) và Sift-down',
        hint: 'Bấm nút [⚡ Rút Max()] để lấy khóa lớn nhất và vun lại đống',
        buttonId: 'btn-heap-extract'
      }
    ]
  }
};

/**
 * Lấy nhiệm vụ thực hành của thuật toán
 * @param {string} algoId 
 * @returns {object|null}
 */
export function getPracticeMission(algoId) {
  return PRACTICE_MISSIONS[algoId] || null;
}
