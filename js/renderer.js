/**
 * DSA Visualizer - Renderer (js/renderer.js)
 * Trực quan hóa các bước: vẽ cột bo góc mượt mà, hiệu ứng trượt FLIP khi hoán đổi,
 * bảng chạy tay từng bước với dấu <-> (cuộn nội bộ an toàn KHÔNG nhảy trang),
 * ô số tìm kiếm, vùng phụ trợ và mã giả.
 */

import { player } from './player.js';
import { soundFX } from './audio.js';

export class Renderer {
  constructor() {
    this.canvasContainer = document.getElementById('visualizer-canvas');
    this.auxiliaryArea = document.getElementById('auxiliary-area');
    this.stepMessageText = document.getElementById('step-message-text');
    this.pseudocodeLinesContainer = document.getElementById('pseudocode-lines');
    this.statComparisons = document.getElementById('stat-comparisons');
    this.statSwaps = document.getElementById('stat-swaps');
    this.stepCounter = document.getElementById('step-counter');
    this.stepSlider = document.getElementById('step-slider');
    this.traceTableBody = document.getElementById('trace-table-body');

    // Lưu trữ DOM element theo ID để thực hiện hiệu ứng trượt FLIP
    this.domBarMap = new Map();
    this.cachedStepsForTrace = null;
    this.cachedAlgoId = null;
  }

  /**
   * Cuộn an toàn CHỈ TRONG KHUNG CHỨA NỘI BỘ, TUYỆT ĐỐI không làm cuộn cả trang web
   * @param {HTMLElement} container 
   * @param {HTMLElement} target 
   */
  safeScrollContainer(container, target) {
    if (!container || !target) return;
    const targetTop = target.offsetTop;
    const targetHeight = target.offsetHeight;
    const containerScrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    if (targetTop < containerScrollTop) {
      container.scrollTop = targetTop;
    } else if (targetTop + targetHeight > containerScrollTop + containerHeight) {
      container.scrollTop = targetTop + targetHeight - containerHeight;
    }
  }

  /**
   * Render toàn bộ bước hiện tại
   * @param {object} step - Dữ liệu bước hiện tại
   * @param {object} algo - Thông tin thuật toán hiện tại
   * @param {number} currentStepIndex - Chỉ số bước hiện tại
   * @param {number} totalSteps - Tổng số bước
   * @param {Array} allSteps - Toàn bộ danh sách các bước
   */
  renderStep(step, algo, currentStepIndex, totalSteps, allSteps = []) {
    if (!step) return;

    // 1. Cập nhật giao diện chính theo loại cấu trúc dữ liệu / thuật toán
    if (algo?.isTree || step.isTree) {
      this.renderTreeStructure(step, algo);
    } else if (algo?.isLinear || step.isLinear) {
      this.renderLinearStructure(step, algo);
    } else if (algo.isSearch) {
      this.renderSearchTiles(step, algo);
    } else {
      this.renderSortBars(step);
    }

    // 2. Cập nhật vùng phụ trợ (counting, radix buckets, merge halves)
    this.renderAuxiliary(step.groups);

    // Phát âm thanh thuật toán tương ứng cho bước hiện tại khi chạy tự động hoặc bước thủ công
    if (step.isTree) {
      if (step.isComplete) {
        soundFX.playVictory([{ value: 25 }, { value: 50 }, { value: 75 }]);
      } else if (step.activeAction?.includes('rotate') || step.activeAction?.includes('unbalanced')) {
        soundFX.playSwap(60, 30);
      } else if (step.activeAction?.includes('search_found')) {
        soundFX.playCorrectDing();
      } else if (step.activeAction?.includes('compare') || step.activeAction?.includes('search') || step.activeAction?.includes('heapify_check')) {
        soundFX.playCompare(40, 50);
      } else if (step.activeAction?.includes('insert') || step.activeAction?.includes('inorder_visit')) {
        soundFX.playTone(step.activeItem || 50);
      } else if (step.activeAction?.includes('swap')) {
        soundFX.playSwap(50, 30);
      }
    } else if (step.isLinear) {
      if (step.isComplete) {
        soundFX.playVictory([{ value: 20 }, { value: 40 }, { value: 60 }]);
      } else if (step.activeAction?.includes('push') || step.activeAction?.includes('enqueue') || step.activeAction?.includes('insert')) {
        soundFX.playTone(step.activeItem || 45);
      } else if (step.activeAction?.includes('pop') || step.activeAction?.includes('dequeue') || step.activeAction?.includes('delete')) {
        soundFX.playSwap(step.activeItem || 50, 20);
      } else if (step.activeAction?.includes('peek') || step.activeAction?.includes('search')) {
        soundFX.playCompare(35, 55);
      } else if (step.activeAction?.includes('reverse')) {
        soundFX.playTone(60);
      }
    } else if (!step.isUserStep && step.highlights && step.array) {
      if (step.isComplete) {
        soundFX.playVictory(step.array);
      } else {
        const swpIdx = Object.entries(step.highlights).filter(([_, s]) => s === 'swp').map(([i]) => Number(i));
        const cmpIdx = Object.entries(step.highlights).filter(([_, s]) => s === 'cmp').map(([i]) => Number(i));
        if (swpIdx.length >= 2 && step.array[swpIdx[0]] && step.array[swpIdx[1]]) {
          soundFX.playSwap(step.array[swpIdx[0]].value, step.array[swpIdx[1]].value);
        } else if (cmpIdx.length >= 2 && step.array[cmpIdx[0]] && step.array[cmpIdx[1]]) {
          soundFX.playCompare(step.array[cmpIdx[0]].value, step.array[cmpIdx[1]].value);
        } else if (cmpIdx.length === 1 && step.array[cmpIdx[0]]) {
          soundFX.playTone(step.array[cmpIdx[0]].value);
        }
      }
    }

    // 3. Cập nhật câu giải thích tiếng Việt và trạng thái đúng/sai
    if (this.stepMessageText) {
      this.stepMessageText.textContent = step.message || '';
    }

    const msgBox = document.getElementById('step-message-box');
    const msgIcon = msgBox ? msgBox.querySelector('.step-message-icon') : null;
    if (msgBox) {
      msgBox.classList.remove('user-correct', 'user-wrong');
      if (step.isUserStep && step.userEvaluation) {
        if (step.userEvaluation.isSearch) {
          // 2 thuật toán tìm kiếm: chỉ cho phép tương tác tự do, KHÔNG áp dụng đúng/sai
          if (msgIcon) msgIcon.textContent = '🔄';
        } else if (step.userEvaluation.isCorrect) {
          msgBox.classList.add('user-correct');
          if (msgIcon) msgIcon.textContent = step.userEvaluation.isAllSorted ? '🎉' : '✅';
        } else {
          msgBox.classList.add('user-wrong');
          if (msgIcon) msgIcon.textContent = '⚠️';
        }
      } else {
        if (msgIcon) {
          msgIcon.textContent = step.isComplete ? '🎉' : '💡';
        }
      }
    }

    // 4. Tô sáng dòng mã giả tương ứng (cuộn nội bộ)
    this.highlightPseudocodeLine(step.codeLine);

    // 5. Cập nhật số liệu thống kê
    if (this.statComparisons && step.stats) {
      this.statComparisons.textContent = step.stats.comparisons ?? 0;
    }
    if (this.statSwaps && step.stats) {
      this.statSwaps.textContent = step.stats.swaps ?? 0;
    }

    // 6. Cập nhật bộ đếm bước và thanh trượt
    if (this.stepCounter) {
      this.stepCounter.textContent = `Bước ${currentStepIndex + 1} / ${Math.max(1, totalSteps)}`;
    }
    if (this.stepSlider) {
      this.stepSlider.max = Math.max(0, totalSteps - 1);
      this.stepSlider.value = currentStepIndex;
    }

    // 7. Cập nhật Bảng chạy tay từng bước (cuộn nội bộ an toàn)
    this.renderTraceTable(allSteps, currentStepIndex, algo);
  }

  /**
   * Biểu tượng trợ năng cho người khiếm thị màu (Accessibility)
   */
  getStatusAccessibilityIcon(status) {
    switch (status) {
      case 'cmp': return '🔍';
      case 'swp': return '🔄';
      case 'err': return '⚠️';
      case 'piv': return '📌';
      case 'ok':  return '✓';
      case 'fnd': return '★';
      case 'miss': return '✕';
      default: return '';
    }
  }

  /**
   * Trực quan hóa Cột Sắp Xếp với hiệu ứng trượt FLIP mượt mà khi đổi chỗ
   */
  renderSortBars(step) {
    if (!this.canvasContainer) return;

    let container = this.canvasContainer.querySelector('.bars-container');
    const isFirstInit = !container;

    if (!container) {
      this.canvasContainer.innerHTML = '';
      container = document.createElement('div');
      container.className = 'bars-container';
      this.canvasContainer.appendChild(container);
      this.domBarMap.clear();
    }

    const currentStepIdSet = new Set(step.array.map(item => item.id));

    // Kiểm tra xem mảng này có phải là mảng mới hoàn toàn không (reset mảng)
    let isFullArrayReset = false;
    if (this.domBarMap.size === 0) {
      isFullArrayReset = true;
    } else {
      let hasOverlap = false;
      for (const id of currentStepIdSet) {
        if (this.domBarMap.has(id)) {
          hasOverlap = true;
          break;
        }
      }
      if (!hasOverlap) {
        isFullArrayReset = true;
      }
    }

    // Nếu là mảng mới được tạo (đổi thuật toán, đổi số lượng, tạo ngẫu nhiên, tự nhập mảng):
    // Xóa sạch toàn bộ các cột cũ để không bị nhân bản hay spam phần tử
    if (isFullArrayReset) {
      container.innerHTML = '';
      this.domBarMap.clear();
    } else {
      // Dọn sạch mọi phần tử DOM thừa trong container không thuộc về bước hiện tại
      Array.from(container.children).forEach(child => {
        if (!currentStepIdSet.has(child.dataset.id)) {
          child.remove();
        }
      });
      for (const id of this.domBarMap.keys()) {
        if (!currentStepIdSet.has(id)) {
          this.domBarMap.delete(id);
        }
      }
    }

    const maxVal = Math.max(...step.array.map(item => item.value), 1);
    const minHeightPx = 38;
    const maxHeightPx = 200;

    // 1. [FLIP - First]: Lưu vị trí ngang cũ của các cột (chỉ khi không reset mảng)
    const firstPositions = new Map();
    if (!isFullArrayReset) {
      this.domBarMap.forEach((el, id) => {
        const rect = el.getBoundingClientRect();
        firstPositions.set(id, rect.left);
      });
    }

    // 2. Tạo hoặc cập nhật các phần tử DOM theo item.id
    const currentElements = [];
    const newDomMap = new Map();

    step.array.forEach((item, index) => {
      let barWrapper = this.domBarMap.get(item.id);
      const status = step.highlights ? step.highlights[index] : null;
      const tag = step.tags ? step.tags[index] : null;
      const isSwapping = status === 'swp';

      if (!barWrapper) {
        barWrapper = document.createElement('div');
        barWrapper.className = 'bar-wrapper';
        barWrapper.dataset.id = item.id;

        const barCol = document.createElement('div');
        barCol.className = 'bar-column';

        const valLabel = document.createElement('span');
        valLabel.className = 'bar-val-label';
        barCol.appendChild(valLabel);

        const statusBadge = document.createElement('div');
        statusBadge.className = 'bar-status-badge';
        barCol.appendChild(statusBadge);

        barWrapper.appendChild(barCol);

        const idxBadge = document.createElement('span');
        idxBadge.className = 'bar-idx-badge';
        barWrapper.appendChild(idxBadge);
      }

      // Luôn cập nhật vị trí index hiện tại và cho phép tương tác kéo-thả
      barWrapper.dataset.index = index;
      barWrapper.draggable = true;
      barWrapper.title = 'Kéo thả hoặc bấm để tự sắp xếp';

      if (isSwapping) {
        barWrapper.classList.add('is-swapping');
      } else {
        barWrapper.classList.remove('is-swapping');
      }

      // Cập nhật tooltip con trỏ
      let badgeContainer = barWrapper.querySelector('.pointer-badge-container');
      if (tag) {
        if (!badgeContainer) {
          badgeContainer = document.createElement('div');
          badgeContainer.className = 'pointer-badge-container';
          badgeContainer.innerHTML = `
            <div class="pointer-badge"></div>
            <div class="pointer-arrow"></div>
          `;
          barWrapper.insertBefore(badgeContainer, barWrapper.firstChild);
        }

        let tagClass = 'tag-i';
        const tagLower = String(tag).toLowerCase();
        if (tagLower.includes('j')) tagClass = 'tag-j';
        else if (tagLower.includes('pivot')) tagClass = 'tag-pivot';
        else if (tagLower.includes('min')) tagClass = 'tag-min';
        else if (tagLower.includes('mid')) tagClass = 'tag-mid';
        else if (tagLower.includes('lo')) tagClass = 'tag-lo';
        else if (tagLower.includes('hi')) tagClass = 'tag-hi';

        const badge = badgeContainer.querySelector('.pointer-badge');
        const arrow = badgeContainer.querySelector('.pointer-arrow');
        badge.className = `pointer-badge ${tagClass}`;
        badge.textContent = tag;
        arrow.className = `pointer-arrow ${tagClass}`;
        badgeContainer.style.display = 'flex';
      } else if (badgeContainer) {
        badgeContainer.style.display = 'none';
      }

      const barCol = barWrapper.querySelector('.bar-column');
      barCol.className = 'bar-column';
      if (status) {
        barCol.classList.add(`status-${status}`);
      }

      const calculatedHeight = Math.round((item.value / maxVal) * (maxHeightPx - minHeightPx) + minHeightPx);
      barCol.style.height = `${calculatedHeight}px`;

      const valLabel = barWrapper.querySelector('.bar-val-label');
      valLabel.textContent = item.value;

      const statusBadge = barWrapper.querySelector('.bar-status-badge');
      const iconText = this.getStatusAccessibilityIcon(status);
      statusBadge.textContent = iconText;
      statusBadge.style.visibility = iconText ? 'visible' : 'hidden';

      const idxBadge = barWrapper.querySelector('.bar-idx-badge');
      idxBadge.textContent = index;

      currentElements.push(barWrapper);
      newDomMap.set(item.id, barWrapper);
    });

    // 3. [FLIP - Last]: Đặt lại thứ tự DOM và dọn dẹp triệt để bất kỳ node cũ nào
    currentElements.forEach(el => container.appendChild(el));

    Array.from(container.children).forEach(child => {
      if (!newDomMap.has(child.dataset.id)) {
        child.remove();
      }
    });

    this.domBarMap = newDomMap;

    // 4. [FLIP - Invert & Play]: Tính độ lệch và kích hoạt chuyển động trượt ngang
    if (!isFirstInit && !isFullArrayReset) {
      currentElements.forEach(el => {
        const id = el.dataset.id;
        const firstLeft = firstPositions.get(id);
        const lastLeft = el.getBoundingClientRect().left;

        if (firstLeft !== undefined && firstLeft !== lastLeft) {
          const deltaX = firstLeft - lastLeft;
          const isSwapping = el.classList.contains('is-swapping');

          el.style.transition = 'none';
          el.style.transform = `translate3d(${deltaX}px, ${isSwapping ? -22 : 0}px, 0)`;

          void el.offsetHeight; // Force reflow

          requestAnimationFrame(() => {
            el.style.transition = 'transform var(--slide-duration) var(--ease-spring)';
            el.style.transform = isSwapping ? 'translate3d(0, -22px, 0)' : 'translate3d(0, 0, 0)';
          });
        } else if (!el.classList.contains('is-swapping')) {
          el.style.transform = 'translate3d(0, 0, 0)';
        }
      });
    }
  }

  /**
   * Trực quan hóa Dãy Ô Số cho Tìm Kiếm
   */
  renderSearchTiles(step, algo) {
    if (!this.canvasContainer) return;
    this.canvasContainer.innerHTML = '';
    this.domBarMap.clear();

    if (algo.id === 'binary' && step.range) {
      const rangeIndicator = document.createElement('div');
      rangeIndicator.className = 'search-range-indicator';
      rangeIndicator.innerHTML = `<span>Khoảng tìm kiếm hiện tại: <strong>[${step.range[0]} ... ${step.range[1]}]</strong> (còn ${Math.max(0, step.range[1] - step.range[0] + 1)} phần tử)</span>`;
      this.canvasContainer.appendChild(rangeIndicator);
    }

    const container = document.createElement('div');
    container.className = 'tiles-container';

    step.array.forEach((item, index) => {
      const status = step.highlights ? step.highlights[index] : null;
      const tag = step.tags ? step.tags[index] : null;

      const tileWrapper = document.createElement('div');
      tileWrapper.className = 'tile-wrapper';
      tileWrapper.dataset.id = item.id;
      tileWrapper.dataset.index = index;
      tileWrapper.draggable = true;
      tileWrapper.title = 'Kéo thả hoặc bấm để tự sắp xếp';

      if (tag) {
        const badgeContainer = document.createElement('div');
        badgeContainer.className = 'pointer-badge-container';

        let tagClass = 'tag-i';
        const tagLower = String(tag).toLowerCase();
        if (tagLower.includes('mid')) tagClass = 'tag-mid';
        else if (tagLower.includes('lo')) tagClass = 'tag-lo';
        else if (tagLower.includes('hi')) tagClass = 'tag-hi';
        else if (tagLower.includes('tìm thấy')) tagClass = 'tag-mid';

        badgeContainer.innerHTML = `
          <div class="pointer-badge ${tagClass}">${tag}</div>
          <div class="pointer-arrow ${tagClass}"></div>
        `;
        tileWrapper.appendChild(badgeContainer);
      }

      const tileBox = document.createElement('div');
      tileBox.className = 'tile-box';
      if (status) {
        tileBox.classList.add(`status-${status}`);
      }

      const valSpan = document.createElement('span');
      valSpan.className = 'tile-value';
      valSpan.textContent = item.value;
      tileBox.appendChild(valSpan);

      const iconText = this.getStatusAccessibilityIcon(status);
      if (iconText) {
        const iconBadge = document.createElement('div');
        iconBadge.className = 'bar-status-badge';
        iconBadge.textContent = iconText;
        tileBox.appendChild(iconBadge);
      }

      tileWrapper.appendChild(tileBox);

      const idxSpan = document.createElement('span');
      idxSpan.className = 'tile-idx';
      idxSpan.textContent = `[${index}]`;
      tileWrapper.appendChild(idxSpan);

      container.appendChild(tileWrapper);
    });

    this.canvasContainer.appendChild(container);
  }

  /**
   * Điều hướng trực quan hóa Cấu trúc Cây (BST, AVL Tree, Binary Heap)
   */
  renderTreeStructure(step, algo) {
    if (!this.canvasContainer) return;
    this.canvasContainer.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'tree-canvas-wrapper';

    const root = step.root;
    const stageWidth = 640;
    const initialY = 36;
    const activeNodeId = step.activeNodeId;
    const isFound = step.activeAction === 'search_found';

    // Helper tính toán các chỉ số thống kê của cây
    const getTreeMetrics = (node) => {
      if (!node) return { count: 0, height: 0, leaves: 0 };
      const left = getTreeMetrics(node.left);
      const right = getTreeMetrics(node.right);
      const isLeaf = !node.left && !node.right;
      return {
        count: 1 + left.count + right.count,
        height: 1 + Math.max(left.height, right.height),
        leaves: (isLeaf ? 1 : 0) + left.leaves + right.leaves
      };
    };

    const metrics = getTreeMetrics(root);

    // 1. Thanh thông số cây (Tree Metrics Pill)
    if (root) {
      const metricsEl = document.createElement('div');
      metricsEl.className = 'tree-metrics-pill';
      const treeTypeName = step.treeType === 'avl' ? 'Cây AVL' : (step.treeType === 'heap' ? 'Max-Heap' : 'Binary Search Tree');
      metricsEl.innerHTML = `
        <span>🌳 <strong>${treeTypeName}</strong></span>
        <span>•</span>
        <span>Tổng số Node: <strong>${metrics.count}</strong></span>
        <span>•</span>
        <span>Chiều cao H: <strong>${metrics.height}</strong></span>
        <span>•</span>
        <span>Số Node lá: <strong>${metrics.leaves}</strong></span>
      `;
      wrapper.appendChild(metricsEl);
    }

    // 2. Thanh kết quả duyệt trực quan (Live Traversal Strip)
    if (step.traversalResult && step.traversalResult.length > 0) {
      const travStrip = document.createElement('div');
      travStrip.className = 'tree-traversal-strip';
      const badges = step.traversalResult.map(v => `<span class="tree-traversal-badge">${v}</span>`).join('<span class="tree-traversal-arrow">➔</span>');
      travStrip.innerHTML = `
        <span class="tree-traversal-title">📋 ${step.traversalType || 'Thứ tự duyệt'}:</span>
        <div class="tree-traversal-list">${badges}</div>
      `;
      wrapper.appendChild(travStrip);
    }

    const stage = document.createElement('div');
    stage.className = 'tree-stage';

    // Tự động tính toán chiều cao stage để không bị cắt node ở các tầng sâu
    const dynamicStageHeight = Math.max(310, (metrics.height + 1) * 66 + 30);
    stage.style.height = `${dynamicStageHeight}px`;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'tree-svg-canvas');

    if (!root) {
      const emptyNote = document.createElement('div');
      emptyNote.style.color = 'var(--text-muted)';
      emptyNote.style.fontSize = '13.5px';
      emptyNote.style.margin = '80px auto';
      emptyNote.style.textAlign = 'center';
      emptyNote.textContent = '🌳 Cây rỗng (Root = NULL)';
      stage.appendChild(emptyNote);
    } else {
      // Đệ quy tính toán tọa độ và vẽ cạnh SVG + node HTML
      const renderSubtree = (node, x, y, spread, depth) => {
        if (!node) return;

        // Vẽ cạnh nối sang con trái
        if (node.left) {
          const childX = x - spread;
          const childY = y + 62;
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', x);
          line.setAttribute('y1', y);
          line.setAttribute('x2', childX);
          line.setAttribute('y2', childY);
          line.setAttribute('class', 'tree-edge-line');
          svg.appendChild(line);
          renderSubtree(node.left, childX, childY, spread * 0.52, depth + 1);
        }

        // Vẽ cạnh nối sang con phải
        if (node.right) {
          const childX = x + spread;
          const childY = y + 62;
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', x);
          line.setAttribute('y1', y);
          line.setAttribute('x2', childX);
          line.setAttribute('y2', childY);
          line.setAttribute('class', 'tree-edge-line');
          svg.appendChild(line);
          renderSubtree(node.right, childX, childY, spread * 0.52, depth + 1);
        }

        // Node element
        const nodeEl = document.createElement('div');
        nodeEl.className = 'tree-node';
        nodeEl.style.left = `${x}px`;
        nodeEl.style.top = `${y}px`;
        nodeEl.textContent = node.val;
        nodeEl.title = `Khóa: ${node.val} | Con trái: ${node.left ? node.left.val : 'NULL'} | Con phải: ${node.right ? node.right.val : 'NULL'}`;

        if (activeNodeId && (activeNodeId === node.id || (typeof activeNodeId === 'number' && node.val === activeNodeId))) {
          if (isFound) nodeEl.classList.add('is-found');
          else nodeEl.classList.add('is-active');
        }

        // Hiển thị Balance Factor cho cây AVL
        if (step.treeType === 'avl' && typeof node.bf !== 'undefined') {
          const bfTag = document.createElement('span');
          bfTag.className = 'tree-node-bf';
          bfTag.textContent = `BF:${node.bf >= 0 ? '+' : ''}${node.bf}`;
          nodeEl.appendChild(bfTag);
        }

        stage.appendChild(nodeEl);
      };

      renderSubtree(root, stageWidth / 2, initialY, stageWidth * 0.24, 0);
      stage.appendChild(svg);
    }

    wrapper.appendChild(stage);

    // Nếu là Heap: Biểu diễn kép thêm thanh mảng 1D (Dual View)
    if (step.treeType === 'heap' && step.array && step.array.length > 0) {
      const heapStrip = document.createElement('div');
      heapStrip.className = 'heap-array-strip';

      const heapSize = typeof step.heapSize === 'number' ? step.heapSize : step.array.length;

      step.array.forEach((item, idx) => {
        const cell = document.createElement('div');
        cell.className = 'heap-array-cell';

        if (idx === 0) cell.classList.add('is-heap-root');
        if (step.highlights && step.highlights[idx]) cell.classList.add('is-heap-active');
        if (idx >= heapSize) cell.classList.add('is-heap-sorted');

        cell.innerHTML = `
          <span>${item.value}</span>
          <span class="heap-cell-idx">[${idx}]</span>
        `;
        heapStrip.appendChild(cell);
      });

      const heapNote = document.createElement('div');
      heapNote.style.fontSize = '12px';
      heapNote.style.color = 'var(--text-muted)';
      heapNote.style.marginTop = '6px';
      heapNote.innerHTML = `Mảng 1D của Heap: Cha tại <code>i</code> &nbsp;➔&nbsp; Con trái <code>2i+1</code>, Con phải <code>2i+2</code> (HeapSize = ${heapSize})`;

      wrapper.appendChild(heapStrip);
      wrapper.appendChild(heapNote);
    }

    this.canvasContainer.appendChild(wrapper);
  }

  /**
   * Điều hướng trực quan hóa Cấu trúc Dữ liệu Tuyến tính (Stack, Queue, Linked List)
   */
  renderLinearStructure(step, algo) {
    if (!step) return;
    const type = step.linearType || algo?.linearType;
    if (type === 'stack') {
      this.renderStack(step);
    } else if (type === 'queue') {
      this.renderQueue(step);
    } else if (type === 'linkedList') {
      this.renderLinkedList(step);
    }
  }

  /**
   * Trực quan hóa Ngăn Xếp (Stack - Ống đứng LIFO)
   */
  renderStack(step) {
    if (!this.canvasContainer) return;
    this.canvasContainer.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'stack-canvas-wrapper';

    const tube = document.createElement('div');
    tube.className = 'stack-tube';

    const stackItems = step.stack || [];
    const topIdx = step.top;

    if (stackItems.length === 0) {
      const emptyNote = document.createElement('div');
      emptyNote.style.color = 'var(--text-muted)';
      emptyNote.style.fontSize = '13px';
      emptyNote.style.textAlign = 'center';
      emptyNote.style.margin = 'auto';
      emptyNote.textContent = '(Stack rỗng - Top = -1)';
      tube.appendChild(emptyNote);
    } else {
      stackItems.forEach((item, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'stack-item';
        const isTop = idx === topIdx;
        if (isTop) itemEl.classList.add('is-top');
        if (step.activeAction && isTop) itemEl.classList.add('is-active-action');

        itemEl.innerHTML = `
          <span style="font-size: 11px; opacity: 0.6;">[${idx}]</span>
          <span>${item.value}</span>
        `;

        if (isTop) {
          const topBadge = document.createElement('span');
          topBadge.className = 'stack-top-badge';
          topBadge.innerHTML = '⬅ TOP';
          itemEl.appendChild(topBadge);
        }

        tube.appendChild(itemEl);
      });
    }

    const baseNote = document.createElement('div');
    baseNote.className = 'stack-tube-base';
    baseNote.innerHTML = `⏚ ĐÁY NGĂN XẾP (Bottom) • Sức chứa: ${stackItems.length}/${step.capacity || 8}`;

    wrapper.appendChild(tube);
    wrapper.appendChild(baseNote);
    this.canvasContainer.appendChild(wrapper);
  }

  /**
   * Trực quan hóa Hàng Đợi (Queue - Băng chuyền ngang FIFO)
   */
  renderQueue(step) {
    if (!this.canvasContainer) return;
    this.canvasContainer.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'queue-canvas-wrapper';

    const channel = document.createElement('div');
    channel.className = 'queue-channel';

    const queueItems = step.queue || [];
    const frontIdx = 0;
    const rearIdx = queueItems.length - 1;

    if (queueItems.length === 0) {
      const emptyNote = document.createElement('div');
      emptyNote.style.color = 'var(--text-muted)';
      emptyNote.style.fontSize = '13px';
      emptyNote.style.margin = 'auto';
      emptyNote.textContent = '⇥ (Hàng đợi Queue rỗng - Size = 0) ⇤';
      channel.appendChild(emptyNote);
    } else {
      queueItems.forEach((item, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'queue-item';

        const isFront = idx === frontIdx;
        const isRear = idx === rearIdx;

        if (isFront) itemEl.classList.add('is-front');
        if (isRear) itemEl.classList.add('is-rear');

        if (isFront && isRear) {
          const badge = document.createElement('span');
          badge.className = 'queue-pointer-label queue-pointer-front';
          badge.textContent = 'FRONT & REAR';
          itemEl.appendChild(badge);
        } else if (isFront) {
          const badge = document.createElement('span');
          badge.className = 'queue-pointer-label queue-pointer-front';
          badge.textContent = 'FRONT ⬇';
          itemEl.appendChild(badge);
        } else if (isRear) {
          const badge = document.createElement('span');
          badge.className = 'queue-pointer-label queue-pointer-rear';
          badge.textContent = 'REAR ⬇';
          itemEl.appendChild(badge);
        }

        const valSpan = document.createElement('span');
        valSpan.textContent = item.value;
        itemEl.appendChild(valSpan);

        const idxSpan = document.createElement('span');
        idxSpan.style.fontSize = '10px';
        idxSpan.style.opacity = '0.6';
        idxSpan.textContent = `[${idx}]`;
        itemEl.appendChild(idxSpan);

        channel.appendChild(itemEl);
      });
    }

    const flowNote = document.createElement('div');
    flowNote.style.marginTop = '12px';
    flowNote.style.fontSize = '12px';
    flowNote.style.color = 'var(--text-muted)';
    flowNote.innerHTML = `⬅ Đầu lấy ra (Front / Dequeue) &nbsp;&nbsp;•&nbsp;&nbsp; Hướng luân chuyển FIFO &nbsp;&nbsp;•&nbsp;&nbsp; Đuôi thêm vào (Rear / Enqueue) ⬅`;

    wrapper.appendChild(channel);
    wrapper.appendChild(flowNote);
    this.canvasContainer.appendChild(wrapper);
  }

  /**
   * Trực quan hóa Danh Sách Liên Kết Đơn (Singly Linked List)
   */
  renderLinkedList(step) {
    if (!this.canvasContainer) return;
    this.canvasContainer.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'll-canvas-wrapper';

    const nodes = step.nodes || [];
    const pointers = step.pointers || {};
    const activeNodeId = step.activeNodeId;
    const isFound = step.activeAction === 'search_found';

    if (nodes.length === 0) {
      const nullHead = document.createElement('div');
      nullHead.className = 'll-empty-notice';
      nullHead.innerHTML = `
        <div class="ll-null-badge is-head-null">
          <span class="ll-null-icon">⏚</span>
          <span>HEAD ➔ NULL</span>
        </div>
        <div class="ll-empty-text">Danh sách liên kết đang rỗng. Hãy bấm ➕ Thêm đầu hoặc ➕ Thêm đuôi để bắt đầu!</div>
      `;
      wrapper.appendChild(nullHead);
    } else {
      nodes.forEach((node, idx) => {
        const card = document.createElement('div');
        card.className = 'll-node-card';
        if (activeNodeId === node.id) {
          if (isFound) card.classList.add('is-found');
          else card.classList.add('is-active');
        }

        // Pointer tags: HEAD, TAIL, CURR, PREV
        if (pointers.head === node.id) {
          const tag = document.createElement('span');
          tag.className = 'll-pointer-tag ll-tag-head';
          tag.textContent = 'HEAD ⬇';
          card.appendChild(tag);
        }
        if (pointers.tail === node.id) {
          const tag = document.createElement('span');
          tag.className = 'll-pointer-tag ll-tag-tail';
          tag.textContent = 'TAIL ⬇';
          card.appendChild(tag);
        }
        if (pointers.curr === node.id) {
          const tag = document.createElement('span');
          tag.className = 'll-pointer-tag ll-tag-curr';
          tag.textContent = 'CURR ⬇';
          card.appendChild(tag);
        }
        if (pointers.prev === node.id) {
          const tag = document.createElement('span');
          tag.className = 'll-pointer-tag ll-tag-prev';
          tag.textContent = 'PREV ⬇';
          card.appendChild(tag);
        }

        // Inner Capsule: Khung 2 ngăn bo góc kín hoàn hảo, chống tràn nền và đứt viền
        const capsule = document.createElement('div');
        capsule.className = 'll-node-capsule';

        // Ngăn 1: Data (Giá trị của Node)
        const dataBox = document.createElement('div');
        dataBox.className = 'll-node-data';
        dataBox.textContent = node.value;
        capsule.appendChild(dataBox);

        // Ngăn 2: Next (Con trỏ trỏ tới node tiếp theo)
        const nextBox = document.createElement('div');
        nextBox.className = 'll-node-next';
        nextBox.innerHTML = '<span class="ll-next-dot"></span><span class="ll-next-text">next</span>';
        capsule.appendChild(nextBox);

        card.appendChild(capsule);
        wrapper.appendChild(card);

        // Mũi tên vector liên kết sang node kế tiếp
        const arrow = document.createElement('div');
        arrow.className = 'll-arrow-connector';
        arrow.innerHTML = `
          <svg class="ll-arrow-svg" viewBox="0 0 28 16" width="24" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="2" y1="8" x2="22" y2="8"></line>
            <polyline points="16 3 22 8 16 13"></polyline>
          </svg>
        `;
        wrapper.appendChild(arrow);
      });

      // Node cuối cùng luôn trỏ về NULL
      const nullNode = document.createElement('div');
      nullNode.className = 'll-null-badge';
      nullNode.innerHTML = '<span class="ll-null-icon">⏚</span><span>NULL</span>';
      wrapper.appendChild(nullNode);
    }

    this.canvasContainer.appendChild(wrapper);
  }

  /**
   * Tạo định dạng hiển thị thực thi mảng trực quan (<->) theo từng bước
   * Mô phỏng chuẩn xác cách chạy tay từng bước trên giấy / bảng với vị trí cột cố định
   */
  getStepArrayExecution(step, algo) {
    if (!step) {
      return {
        actionBadge: '<span class="trace-action-badge init">Bắt đầu</span>',
        arrayFlowHtml: '<span style="color: var(--text-muted);">-</span>'
      };
    }

    // Hỗ trợ Bảng chạy tay cho Cấu trúc Cây (Tree DS: BST, AVL, Heap)
    if (step.isTree) {
      let actionBadge = '<span class="trace-action-badge init">ℹ Chi tiết</span>';
      let arrayFlowHtml = '';

      if (step.treeType === 'bst') {
        if (step.activeAction?.includes('insert')) {
          actionBadge = `<span class="trace-action-badge swp">➕ Chèn(${step.activeItem ?? ''})</span>`;
        } else if (step.activeAction?.includes('delete')) {
          actionBadge = `<span class="trace-action-badge err">🗑️ Xóa(${step.activeItem ?? ''})</span>`;
        } else if (step.activeAction?.includes('search_found')) {
          actionBadge = `<span class="trace-action-badge ok">★ Tìm thấy(${step.activeItem ?? ''})</span>`;
        } else if (step.activeAction?.includes('search')) {
          actionBadge = `<span class="trace-action-badge cmp">🔍 Tìm kiếm</span>`;
        } else if (step.activeAction?.includes('inorder')) {
          actionBadge = `<span class="trace-action-badge ok">📖 Inorder</span>`;
        } else if (step.activeAction?.includes('preorder')) {
          actionBadge = `<span class="trace-action-badge ok">🌿 Preorder</span>`;
        } else if (step.activeAction?.includes('postorder')) {
          actionBadge = `<span class="trace-action-badge ok">🍂 Postorder</span>`;
        } else if (step.activeAction?.includes('level')) {
          actionBadge = `<span class="trace-action-badge ok">🌊 BFS</span>`;
        } else if (step.activeAction?.includes('min')) {
          actionBadge = `<span class="trace-action-badge ok">🔻 Min(${step.activeItem ?? ''})</span>`;
        } else if (step.activeAction?.includes('max')) {
          actionBadge = `<span class="trace-action-badge ok">🔺 Max(${step.activeItem ?? ''})</span>`;
        } else {
          actionBadge = '<span class="trace-action-badge init">🌳 BST</span>';
        }
        arrayFlowHtml = `<span style="font-family:var(--font-mono); font-size:12px;">Root: ${step.root ? step.root.val : 'NULL'} | Đang xét: ${step.activeItem ?? '-'}</span>`;
      } else if (step.treeType === 'avl') {
        if (step.activeAction?.includes('unbalanced')) {
          actionBadge = `<span class="trace-action-badge err">⚠️ Mất cân bằng</span>`;
        } else if (step.activeAction?.includes('rotate')) {
          actionBadge = `<span class="trace-action-badge swp">🔄 Phép xoay AVL</span>`;
        } else if (step.activeAction?.includes('insert')) {
          actionBadge = `<span class="trace-action-badge swp">➕ Chèn AVL</span>`;
        } else {
          actionBadge = '<span class="trace-action-badge init">⚖️ AVL Tree</span>';
        }
        arrayFlowHtml = `<span style="font-family:var(--font-mono); font-size:12px;">Root: ${step.root ? step.root.val : 'NULL'} (Tiêu chuẩn |BF| &le; 1)</span>`;
      } else if (step.treeType === 'heap') {
        if (step.activeAction?.includes('swap')) {
          actionBadge = `<span class="trace-action-badge swp">🔄 Đổi chỗ Heap</span>`;
        } else if (step.activeAction?.includes('heapify')) {
          actionBadge = `<span class="trace-action-badge cmp">🔍 Vun đống</span>`;
        } else if (step.activeAction?.includes('phase')) {
          actionBadge = `<span class="trace-action-badge init">📌 Giai đoạn</span>`;
        } else {
          actionBadge = '<span class="trace-action-badge ok">🏔️ Max-Heap</span>';
        }
        const arrStr = step.array ? step.array.map(x => x.value).join(', ') : '';
        arrayFlowHtml = `<span style="font-family:var(--font-mono); font-size:12px;">A = [ ${arrStr} ] (HeapSize: ${step.heapSize ?? '-'})</span>`;
      }

      return { actionBadge, arrayFlowHtml };
    }

    // Hỗ trợ Bảng chạy tay cho Cấu trúc Dữ liệu Tuyến tính (Linear DS)
    if (step.isLinear) {
      let actionBadge = '<span class="trace-action-badge init">ℹ Chi tiết</span>';
      let arrayFlowHtml = '';

      if (step.linearType === 'stack') {
        const stk = step.stack || [];
        if (step.activeAction?.includes('push')) {
          actionBadge = `<span class="trace-action-badge swp">📥 Push(${step.activeItem ?? ''})</span>`;
        } else if (step.activeAction?.includes('pop')) {
          actionBadge = `<span class="trace-action-badge swp">📤 Pop()</span>`;
        } else if (step.activeAction?.includes('peek')) {
          actionBadge = `<span class="trace-action-badge cmp">👁 Peek</span>`;
        } else {
          actionBadge = '<span class="trace-action-badge init">🚀 Khởi tạo</span>';
        }
        const stkStr = stk.length > 0
          ? stk.map((x, i) => i === step.top ? `<strong style="color:var(--primary);">${x.value} (TOP)</strong>` : `${x.value}`).join(' | ')
          : '(Rỗng)';
        arrayFlowHtml = `<span style="font-family:var(--font-mono); font-size:12px;">Đáy [ ${stkStr} ]</span>`;
      } else if (step.linearType === 'queue') {
        const q = step.queue || [];
        if (step.activeAction?.includes('enqueue')) {
          actionBadge = `<span class="trace-action-badge swp">📥 Enqueue(${step.activeItem ?? ''})</span>`;
        } else if (step.activeAction?.includes('dequeue')) {
          actionBadge = `<span class="trace-action-badge swp">📤 Dequeue()</span>`;
        } else if (step.activeAction?.includes('peek')) {
          actionBadge = `<span class="trace-action-badge cmp">👁 Front</span>`;
        } else {
          actionBadge = '<span class="trace-action-badge init">🚀 Khởi tạo</span>';
        }
        const qStr = q.length > 0
          ? q.map(x => `[${x.value}]`).join(' ➔ ')
          : '(Rỗng)';
        arrayFlowHtml = `<span style="font-family:var(--font-mono); font-size:12px;">Front ➔ ${qStr} ➔ Rear</span>`;
      } else if (step.linearType === 'linkedList') {
        const nodes = step.nodes || [];
        if (step.activeAction?.includes('insert_head')) {
          actionBadge = `<span class="trace-action-badge swp">➕ Thêm đầu</span>`;
        } else if (step.activeAction?.includes('insert_tail')) {
          actionBadge = `<span class="trace-action-badge swp">➕ Thêm đuôi</span>`;
        } else if (step.activeAction?.includes('delete_head')) {
          actionBadge = `<span class="trace-action-badge err">🗑️ Xóa đầu</span>`;
        } else if (step.activeAction?.includes('delete_tail')) {
          actionBadge = `<span class="trace-action-badge err">🗑️ Xóa đuôi</span>`;
        } else if (step.activeAction?.includes('clear')) {
          actionBadge = `<span class="trace-action-badge err">🧹 Xóa rỗng</span>`;
        } else if (step.activeAction?.includes('search_found')) {
          actionBadge = `<span class="trace-action-badge ok">★ Tìm thấy(${step.activeItem ?? ''})</span>`;
        } else if (step.activeAction?.includes('search')) {
          actionBadge = `<span class="trace-action-badge cmp">🔍 Tìm(${step.activeItem ?? ''})</span>`;
        } else if (step.activeAction?.includes('reverse')) {
          actionBadge = `<span class="trace-action-badge swp">🔄 Đảo ngược</span>`;
        } else {
          actionBadge = '<span class="trace-action-badge init">🚀 Khởi tạo</span>';
        }
        const nodeStr = nodes.length > 0
          ? nodes.map(n => `[${n.value}]`).join(' ➔ ')
          : 'NULL';
        arrayFlowHtml = `<span style="font-family:var(--font-mono); font-size:12px;">Head ➔ ${nodeStr}${nodes.length > 0 ? ' ➔ NULL' : ''}</span>`;
      }

      return { actionBadge, arrayFlowHtml };
    }

    if (!step.array || step.array.length === 0) {
      return {
        actionBadge: '<span class="trace-action-badge init">Bắt đầu</span>',
        arrayFlowHtml: '<span style="color: var(--text-muted);">-</span>'
      };
    }

    const arr = step.array;
    const highlights = step.highlights || {};
    const hlEntries = Object.entries(highlights);

    // Tìm các vị trí đang được highlight (cmp, swp, err)
    const activeIndices = hlEntries
      .filter(([_, st]) => st === 'cmp' || st === 'swp' || st === 'err')
      .map(([idx]) => Number(idx))
      .sort((a, b) => a - b);

    const isSwap = hlEntries.some(([_, st]) => st === 'swp' || st === 'err');
    const isAllOk = arr.every((_, idx) => highlights[idx] === 'ok');

    // Cặp chỉ số kề nhau đang tương tác
    let interactingAdjacentSlot = -1;
    let arrowClass = isSwap ? 'swp' : 'cmp';
    let actionBadge = '<span class="trace-action-badge init">Khởi đầu</span>';

    // 1. Bước do người dùng tự thao tác (kéo-thả hoặc click hoán đổi)
    if (step.isUserStep) {
      const evalRes = step.userEvaluation;
      if (evalRes) {
        if (evalRes.isSearch) {
          actionBadge = `<span class="trace-action-badge swp">🔄 Hoán đổi</span>`;
        } else if (evalRes.isAllSorted) {
          actionBadge = `<span class="trace-action-badge ok">🎉 Hoàn tất</span>`;
        } else if (evalRes.isCorrect) {
          actionBadge = `<span class="trace-action-badge ok">${evalRes.badgeText || '✓ Xếp đúng'}</span>`;
        } else {
          actionBadge = `<span class="trace-action-badge err">${evalRes.badgeText || '⚠️ Sai quy tắc'}</span>`;
        }
      } else {
        actionBadge = `<span class="trace-action-badge swp">🔄 Hoán đổi</span>`;
      }

      if (step.swappedPair) {
        const [s1, s2] = step.swappedPair;
        const minS = Math.min(s1, s2);
        const maxS = Math.max(s1, s2);
        if (maxS === minS + 1) {
          interactingAdjacentSlot = minS;
        }
        arrowClass = (evalRes && evalRes.isCorrect === false) ? 'err' : 'swp';
      }
    } else if (isAllOk) {
      actionBadge = '<span class="trace-action-badge ok">✓ Hoàn tất</span>';
    } else if (activeIndices.length >= 2) {
      const idx1 = activeIndices[0];
      const idx2 = activeIndices[1];
      if (idx2 === idx1 + 1) {
        interactingAdjacentSlot = idx1;
      }
      actionBadge = isSwap
        ? '<span class="trace-action-badge swp">🔄 Đổi chỗ</span>'
        : '<span class="trace-action-badge cmp">🔍 So sánh</span>';
    }

    // Quick Sort Pivot đang xét
    const pivEntry = hlEntries.find(([_, st]) => st === 'piv');
    if (pivEntry && activeIndices.length < 2) {
      const pIdx = Number(pivEntry[0]);
      const cmpEntry = hlEntries.find(([_, st]) => st === 'cmp');
      if (cmpEntry) {
        const cIdx = Number(cmpEntry[0]);
        if (Math.abs(pIdx - cIdx) === 1) {
          interactingAdjacentSlot = Math.min(pIdx, cIdx);
          arrowClass = 'cmp';
        }
      }
      actionBadge = '<span class="trace-action-badge cmp">📌 Xét chốt</span>';
    }

    // Thuật toán tìm kiếm (Linear Search & Binary Search)
    if (algo?.isSearch) {
      const fndEntry = hlEntries.find(([_, st]) => st === 'fnd');
      const cmpEntry = hlEntries.find(([_, st]) => st === 'cmp');
      if (fndEntry) {
        actionBadge = '<span class="trace-action-badge ok">★ Tìm thấy</span>';
      } else if (cmpEntry) {
        actionBadge = '<span class="trace-action-badge cmp">🔍 Kiểm tra</span>';
      }
    }

    // Cố định phần tử (ok)
    const okEntry = hlEntries.find(([_, st]) => st === 'ok');
    if (!isAllOk && okEntry && activeIndices.length === 0 && !pivEntry && !algo?.isSearch) {
      const hasFixedTag = step.tags && Object.values(step.tags).some(t =>
        typeof t === 'string' && (t.includes('Đúng vị trí') || t.includes('cố định') || t.includes('Cố định') || t.includes('Pivot cố định') || t.includes('Đã chèn'))
      );
      const hasFixedMessage = step.message && (
        step.message.toLowerCase().includes('cố định') ||
        step.message.toLowerCase().includes('đúng vị trí') ||
        step.message.toLowerCase().includes('đã chèn')
      );

      if (hasFixedTag || hasFixedMessage) {
        actionBadge = '<span class="trace-action-badge ok">✓ Cố định</span>';
      } else {
        actionBadge = '<span class="trace-action-badge init">ℹ Thông tin</span>';
      }
    }

    // Phụ trợ (Merge, Counting, Radix)
    if (step.groups && step.groups.length > 0 && activeIndices.length === 0) {
      const g = step.groups[0];
      let badgeText = '🔄 Xử lý';
      if (g.type === 'counting') badgeText = '🔢 Đếm số';
      else if (g.type === 'buckets') badgeText = '📦 Vào xô';
      else if (g.type === 'merge') badgeText = '🔀 Trộn mảng';
      actionBadge = `<span class="trace-action-badge swp">${badgeText}</span>`;
    }

    // XÂY DỰNG DÃY SỐ VỚI KHOẢNG CÁCH CỐ ĐỊNH HOÀN HẢO
    // Mỗi số nằm trong ô cố định 34px, giữa 2 số luôn là slot 26px (có <-> hoặc để trống)
    // Đảm bảo mọi cột số trên tất cả các dòng luôn thẳng hàng tăm tắp, không bị giật/dịch chuyển
    const parts = [];
    for (let k = 0; k < arr.length; k++) {
      const val = arr[k].value;
      const st = highlights[k];

      let numClass = '';
      if (isAllOk || st === 'ok') numClass = 'trace-ok';
      else if (st === 'err') numClass = 'trace-err';
      else if (st === 'swp') numClass = 'trace-swp';
      else if (st === 'cmp') numClass = 'trace-cmp';
      else if (st === 'piv') numClass = 'trace-piv';
      else if (st === 'miss') numClass = 'trace-miss';

      parts.push(`<span class="trace-num ${numClass}">${val}</span>`);

      // Slot giữa số k và số k+1 (luôn chiếm đúng 26px cố định)
      if (k < arr.length - 1) {
        if (k === interactingAdjacentSlot) {
          parts.push(`<span class="trace-slot"><span class="trace-arrow-link ${arrowClass}">&lt;-&gt;</span></span>`);
        } else {
          parts.push(`<span class="trace-slot"></span>`);
        }
      }
    }

    // Nếu là Search: hiển thị Target ở cuối dãy số với khoảng cách cố định
    if (algo?.isSearch) {
      const targetVal = state.targetValue;
      const fndEntry = hlEntries.find(([_, st]) => st === 'fnd');
      const arrowCls = fndEntry ? 'ok' : 'cmp';
      parts.push(`<span class="trace-slot"><span class="trace-arrow-link ${arrowCls}">&lt;-&gt;</span></span>`);
      parts.push(`<span class="trace-target-chip">Target (${targetVal})</span>`);
    }

    return {
      actionBadge,
      arrayFlowHtml: parts.join('')
    };
  }

  /**
   * Render Bảng chạy tay từng bước (Trace Table) - CHẠY THEO TỪNG BƯỚC, KHÔNG IN SẴN TRƯỚC
   */
  renderTraceTable(allSteps, currentStepIndex, algo) {
    if (!this.traceTableBody || !allSteps || allSteps.length === 0) return;

    // Nếu đổi thuật toán hoặc đổi mảng thì dọn sạch bảng chạy tay
    const algoChanged = this.cachedAlgoId !== algo.id || this.cachedStepsForTrace !== allSteps;
    if (algoChanged) {
      this.cachedStepsForTrace = allSteps;
      this.cachedAlgoId = algo.id;
      this.traceTableBody.innerHTML = '';
    }

    // Số dòng hiển thị: CHỈ TỪ BƯỚC 0 ĐẾN BƯỚC HIỆN TẠI (currentStepIndex)
    const targetRowCount = Math.min(currentStepIndex + 1, allSteps.length);
    let existingRowCount = this.traceTableBody.children.length;

    // 1. Nếu đang lùi bước: cắt bớt các dòng dư phía sau
    if (existingRowCount > targetRowCount) {
      while (this.traceTableBody.children.length > targetRowCount) {
        this.traceTableBody.lastElementChild.remove();
      }
      existingRowCount = this.traceTableBody.children.length;
    }

    // 2. Nếu đang tiến bước: append tiếp các dòng mới chạy tới
    if (existingRowCount < targetRowCount) {
      for (let idx = existingRowCount; idx < targetRowCount; idx++) {
        const stepItem = allSteps[idx];
        if (!stepItem) break;

        const tr = document.createElement('tr');
        tr.className = `trace-row ${idx === currentStepIndex ? 'active' : ''}`;
        tr.dataset.stepIndex = idx;

        const { actionBadge, arrayFlowHtml } = this.getStepArrayExecution(stepItem, algo);

        tr.innerHTML = `
          <td><span class="trace-step-badge">#${idx + 1}</span></td>
          <td>${actionBadge}</td>
          <td><div class="trace-array-flow">${arrayFlowHtml}</div></td>
        `;

        tr.addEventListener('click', () => {
          player.goToStep(idx);
        });

        this.traceTableBody.appendChild(tr);
      }
    }

    // 3. Cập nhật dòng active hiện tại
    const rows = this.traceTableBody.querySelectorAll('.trace-row');
    let activeRow = null;
    rows.forEach(r => {
      const rowIdx = Number(r.dataset.stepIndex);
      if (rowIdx === currentStepIndex) {
        r.classList.add('active');
        activeRow = r;
      } else {
        r.classList.remove('active');
      }
    });

    // 4. Tự động cuộn theo bước mới nhất một cách mượt mà và an toàn
    if (activeRow) {
      const tableWrapper = this.traceTableBody.closest('.trace-table-wrapper');
      this.safeScrollContainer(tableWrapper, activeRow);
    }
  }

  /**
   * Render vùng phụ trợ (Counting, Radix, Merge)
   */
  renderAuxiliary(groups) {
    if (!this.auxiliaryArea) return;

    if (!groups || groups.length === 0) {
      this.auxiliaryArea.innerHTML = '';
      this.auxiliaryArea.classList.remove('has-data');
      return;
    }

    this.auxiliaryArea.classList.add('has-data');
    this.auxiliaryArea.innerHTML = '';

    groups.forEach(group => {
      const card = document.createElement('div');
      card.className = 'aux-card';

      const title = document.createElement('div');
      title.className = 'aux-title';
      title.textContent = group.title;
      card.appendChild(title);

      if (group.type === 'counting') {
        const grid = document.createElement('div');
        grid.className = 'counting-grid';
        group.data.forEach(cell => {
          const c = document.createElement('div');
          c.className = `count-cell ${cell.active ? 'active' : ''}`;
          c.innerHTML = `<span class="count-cell-idx">k=${cell.index}</span><span class="count-cell-val">${cell.count}</span>`;
          grid.appendChild(c);
        });
        card.appendChild(grid);
      } else if (group.type === 'buckets') {
        const grid = document.createElement('div');
        grid.className = 'buckets-grid';
        group.buckets.forEach(b => {
          const col = document.createElement('div');
          col.className = 'bucket-col';
          col.innerHTML = `<div class="bucket-label">Xô ${b.digit}</div>`;

          const itemsWrap = document.createElement('div');
          itemsWrap.className = 'bucket-items';
          b.items.forEach(val => {
            const chip = document.createElement('div');
            chip.className = 'bucket-chip';
            chip.textContent = val;
            itemsWrap.appendChild(chip);
          });
          col.appendChild(itemsWrap);
          grid.appendChild(col);
        });
        card.appendChild(grid);
      } else if (group.type === 'merge') {
        const splitGrid = document.createElement('div');
        splitGrid.className = 'merge-split-grid';

        const leftBox = document.createElement('div');
        leftBox.className = 'merge-box';
        leftBox.innerHTML = `<span class="merge-box-label">Nửa Trái (Left)</span><div class="merge-items-row">${group.left.map(x => `<span class="bucket-chip ${x.active ? 'active' : ''}">${x.value}</span>`).join('')}</div>`;

        const rightBox = document.createElement('div');
        rightBox.className = 'merge-box';
        rightBox.innerHTML = `<span class="merge-box-label">Nửa Phải (Right)</span><div class="merge-items-row">${group.right.map(x => `<span class="bucket-chip ${x.active ? 'active' : ''}">${x.value}</span>`).join('')}</div>`;

        splitGrid.appendChild(leftBox);
        splitGrid.appendChild(rightBox);
        card.appendChild(splitGrid);
      }

      this.auxiliaryArea.appendChild(card);
    });
  }

  /**
   * Khởi tạo khung mã giả ban đầu
   */
  initPseudocode(pseudocodeList) {
    if (!this.pseudocodeLinesContainer) return;
    this.pseudocodeLinesContainer.innerHTML = '';

    pseudocodeList.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const lineEl = document.createElement('div');
      lineEl.className = 'code-line';
      lineEl.dataset.line = lineNum;

      lineEl.innerHTML = `
        <span class="code-line-arrow">▶</span>
        <span class="code-line-num">${lineNum}</span>
        <span class="code-line-text">${lineText}</span>
      `;
      this.pseudocodeLinesContainer.appendChild(lineEl);
    });
  }

  /**
   * Tô sáng đúng dòng mã giả đang chạy (cuộn nội bộ an toàn)
   */
  highlightPseudocodeLine(lineNumber) {
    if (!this.pseudocodeLinesContainer) return;

    const allLines = this.pseudocodeLinesContainer.querySelectorAll('.code-line');
    let activeLine = null;
    allLines.forEach(line => {
      const lineNum = Number(line.dataset.line);
      if (lineNum === lineNumber) {
        line.classList.add('active');
        activeLine = line;
      } else {
        line.classList.remove('active');
      }
    });

    if (activeLine) {
      const codeView = this.pseudocodeLinesContainer.closest('.code-view');
      this.safeScrollContainer(codeView, activeLine);
    }
  }
}
