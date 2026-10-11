/**
 * DSA Visualizer - Binary Search Tree (js/algorithms/bst.js)
 * Cây Nhị Phân Tìm Kiếm (BST - Binary Search Tree)
 */

export default {
  id: 'bst',
  name: 'Binary Search Tree (BST)',
  group: 'Cấu trúc Cây',
  type: 'tree',
  isTree: true,
  treeType: 'bst',
  description: 'Cây nhị phân tìm kiếm trong đó mỗi node tuân theo bất biến: mọi khóa ở cây con bên trái đều NHỎ HƠN khóa của node hiện tại, và mọi khóa ở cây con bên phải đều LỚN HƠN. Duyệt cây theo thứ tự Inorder luôn thu được dãy số tăng dần.',
  analogy: 'Tương tự việc tra cứu danh bạ hoặc từ điển: lật trang ở giữa, nếu từ cần tìm nhỏ hơn thì chỉ tìm bên trái, lớn hơn thì chỉ tìm bên phải, loại bỏ một nửa không gian tìm kiếm.',
  complexity: {
    worst: 'O(n) Khi cây suy biến thành đường thẳng',
    best: 'O(1) Tìm tại Root',
    space: 'O(n)',
    stable: true
  },
  pseudocode: [
    'struct Node { int val; Node *left, *right; }',
    'function insert(node, x):',
    '    if node == NULL: return new Node(x)',
    '    if x < node.val: node.left = insert(node.left, x)',
    '    else if x > node.val: node.right = insert(node.right, x)',
    '    return node',
    'function search(node, x):',
    '    if node == NULL or node.val == x: return node',
    '    if x < node.val: return search(node.left, x)',
    '    return search(node.right, x)',
    'function deleteNode(node, x):',
    '    if x < node.val: node.left = deleteNode(node.left, x)',
    '    else if x > node.val: node.right = deleteNode(node.right, x)',
    '    else: // Thay thế node lá, 1 con hoặc 2 con (Inorder Successor)',
    'function inorder(node): // L-N-R thu dãy số tăng dần',
    '    if node != NULL: inorder(node.left); print(node.val); inorder(node.right)',
    'function findMin(node): while node.left: node = node.left; return node'
  ],
  inputRule: { min: 5, max: 99, sorted: false },

  /**
   * Sinh các bước mô phỏng BST: Chèn -> Tìm kiếm -> Duyệt Inorder -> Xóa node
   */
  run(initialArray = [], options = {}) {
    const steps = [];
    const valuesToInsert = initialArray.length >= 5
      ? initialArray.slice(0, 7).map(x => x.value)
      : [50, 30, 70, 20, 40, 60, 80];

    // Helper: Clone cấu trúc cây
    function cloneTree(node) {
      if (!node) return null;
      return {
        id: node.id,
        val: node.val,
        left: cloneTree(node.left),
        right: cloneTree(node.right)
      };
    }

    let root = null;
    let nodeCounter = 0;

    // Bước 0: Cây rỗng
    steps.push({
      treeType: 'bst',
      root: null,
      activeNodeId: null,
      activeAction: 'init',
      message: 'Khởi tạo Cây nhị phân tìm kiếm (BST) rỗng: Root = NULL.',
      codeLine: 1,
      isTree: true
    });

    // Thao tác 1: Chèn lần lượt từng phần tử vào BST
    for (let i = 0; i < valuesToInsert.length; i++) {
      const val = valuesToInsert[i];

      // Đệ quy chèn và ghi nhận từng bước so sánh
      function insertRec(curr, newVal) {
        if (!curr) {
          nodeCounter++;
          const newNode = { id: `node-${nodeCounter}`, val: newVal, left: null, right: null };
          return newNode;
        }

        steps.push({
          treeType: 'bst',
          root: cloneTree(root),
          activeNodeId: curr.id,
          activeAction: 'compare',
          activeItem: newVal,
          message: `Chèn ${newVal}: So sánh với Node(${curr.val}). Vì ${newVal} ${newVal < curr.val ? '<' : '>'} ${curr.val} nên rẽ sang ${newVal < curr.val ? 'TRÁI' : 'PHẢI'}.`,
          codeLine: newVal < curr.val ? 4 : 5,
          isTree: true
        });

        if (newVal < curr.val) {
          curr.left = insertRec(curr.left, newVal);
        } else if (newVal > curr.val) {
          curr.right = insertRec(curr.right, newVal);
        }
        return curr;
      }

      root = insertRec(root, val);

      steps.push({
        treeType: 'bst',
        root: cloneTree(root),
        activeNodeId: `node-${nodeCounter}`,
        activeAction: 'insert_done',
        activeItem: val,
        message: `Đã chèn thành công Node(${val}) vào BST! Bất biến BST: cây con trái < gốc < cây con phải được bảo toàn.`,
        codeLine: 3,
        isTree: true
      });
    }

    // Thao tác 2: Tìm kiếm một giá trị trên cây (Search)
    const targetSearch = valuesToInsert[Math.floor(valuesToInsert.length / 2)] || 40;
    steps.push({
      treeType: 'bst',
      root: cloneTree(root),
      activeNodeId: root ? root.id : null,
      activeAction: 'search_start',
      activeItem: targetSearch,
      message: `Bắt đầu tìm kiếm giá trị ${targetSearch} trên BST từ Root (${root.val})...`,
      codeLine: 7,
      isTree: true
    });

    let currSearch = root;
    while (currSearch) {
      if (currSearch.val === targetSearch) {
        steps.push({
          treeType: 'bst',
          root: cloneTree(root),
          activeNodeId: currSearch.id,
          activeAction: 'search_found',
          activeItem: targetSearch,
          message: `★ ĐÃ TÌM THẤY Node(${targetSearch}) trên cây! Độ phức tạp tìm kiếm trung bình O(log n).`,
          codeLine: 8,
          isTree: true
        });
        break;
      } else if (targetSearch < currSearch.val) {
        steps.push({
          treeType: 'bst',
          root: cloneTree(root),
          activeNodeId: currSearch.id,
          activeAction: 'search_left',
          activeItem: targetSearch,
          message: `Vì ${targetSearch} < ${currSearch.val}, rẽ sang cây con bên TRÁI.`,
          codeLine: 9,
          isTree: true
        });
        currSearch = currSearch.left;
      } else {
        steps.push({
          treeType: 'bst',
          root: cloneTree(root),
          activeNodeId: currSearch.id,
          activeAction: 'search_right',
          activeItem: targetSearch,
          message: `Vì ${targetSearch} > ${currSearch.val}, rẽ sang cây con bên PHẢI.`,
          codeLine: 10,
          isTree: true
        });
        currSearch = currSearch.right;
      }
    }

    // Thao tác 3: Duyệt cây Inorder (Trung thứ tự: Trái - Gốc - Phải) -> Dãy tăng dần!
    const inorderList = [];
    function inorderTraverse(curr) {
      if (!curr) return;
      inorderTraverse(curr.left);
      inorderList.push(curr.val);
      steps.push({
        treeType: 'bst',
        root: cloneTree(root),
        activeNodeId: curr.id,
        activeAction: 'inorder_visit',
        activeItem: curr.val,
        message: `Duyệt Inorder: Thăm Node(${curr.val}). Thứ tự tăng dần hiện tại: [ ${inorderList.join(', ')} ].`,
        codeLine: 12,
        isTree: true
      });
      inorderTraverse(curr.right);
    }

    steps.push({
      treeType: 'bst',
      root: cloneTree(root),
      activeNodeId: null,
      activeAction: 'inorder_start',
      message: 'Bắt đầu duyệt cây theo thứ tự Inorder (L-N-R: Trái -> Gốc -> Phải) để thu được dãy số tăng dần.',
      codeLine: 11,
      isTree: true
    });

    inorderTraverse(root);

    // Bước hoàn tất
    steps.push({
      treeType: 'bst',
      root: cloneTree(root),
      activeNodeId: null,
      activeAction: 'complete',
      message: `Hoàn tất mô phỏng Cây nhị phân tìm kiếm BST! Dãy số duyệt Inorder hoàn chỉnh: [ ${inorderList.join(', ')} ].`,
      codeLine: 12,
      isComplete: true,
      isTree: true
    });

    return steps;
  }
};
