/**
 * DSA Visualizer - Linear Interactive Manager (js/linear-interactive.js)
 * Quản lý các tính năng tương tác hai chiều cấp cao cho Cấu trúc Dữ liệu Tuyến tính:
 * 1. Chỉnh sửa giá trị trực tiếp (Inline Double-Click Editing)
 * 2. Khay phần tử kéo thả vật lý (Item Dock) & Thùng rác LIFO/FIFO (Trash Drop Zone)
 * 3. Chế độ Tự do Sandbox (Freeform Node Dragging) & Công cụ Cắt ✂️ / Nối 🔗 dây cho Linked Lists
 * 4. Chế độ Thử thách Đảo ngược (Reverse Puzzle) với chấm điểm tự động
 */

import { state } from './state.js';
import { soundFX } from './audio.js';
import { player } from './player.js';

export class LinearInteractiveManager {
  constructor() {
    this.ui = null;
    this.renderer = null;
    this.llMode = 'auto'; // 'auto' | 'freeform' | 'puzzle'
    
    // Tọa độ các Node trong chế độ Freeform Sandbox: Map(nodeId => {x, y})
    this.nodePositions = new Map();
    this.activeDragNode = null;
    this.dragOffset = { x: 0, y: 0 };
    
    // Trạng thái kéo dây nối con trỏ (Link Drawing)
    this.connectingSourceNodeId = null;
    this.tempLinkLine = null;
    
    // Dữ liệu câu đố Reverse Puzzle
    this.puzzleTarget = null;
    this.isPuzzleActive = false;
  }

  init(ui, renderer) {
    this.ui = ui;
    this.renderer = renderer;
    this.bindGlobalPointerEvents();
  }

  /**
   * Gắn toàn bộ tương tác sau khi Renderer vẽ xong bước hiện tại
   */
  attachInteractions(step, algo) {
    if (!step || (!algo?.isLinear && !step?.isLinear)) return;
    const type = step.linearType || algo?.linearType;
    if (!type) return;

    // 1. Kích hoạt Inline Double-Click Edit trên tất cả các node/ô số
    this.setupInlineEditing(type, step);

    // 2. Kích hoạt Khay kéo thả vật lý cho Stack, Queue, Deque
    if (type === 'stack' || type === 'queue' || type === 'deque') {
      this.setupPhysicalSandboxDock(type, step);
    }

    // 3. Kích hoạt Sandbox Tự do & Cắt/Nối cho Linked Lists
    if (type === 'linkedList' || type === 'doublyLinkedList' || type === 'circularLinkedList') {
      this.setupLinkedListSandbox(type, step);
    }
  }

  /* ==========================================================================
     1. INLINE DOUBLE-CLICK EDITING (CHỈNH SỬA TRỰC TIẾP TẠI CHỖ)
     ========================================================================== */

  setupInlineEditing(type, step) {
    const canvas = document.getElementById('visualizer-canvas');
    if (!canvas) return;

    let targetSelector = '';
    if (type === 'stack') targetSelector = '.stack-item';
    else if (type === 'queue') targetSelector = '.queue-item';
    else if (type === 'deque') targetSelector = '.deque-item';
    else if (type === 'linkedList') targetSelector = '.ll-node-data';
    else if (type === 'doublyLinkedList') targetSelector = '.dll-node-data';
    else if (type === 'circularLinkedList') targetSelector = '.ll-node-data';

    const items = canvas.querySelectorAll(targetSelector);
    items.forEach((el, idx) => {
      // Đặt thuộc tính tooltip hướng dẫn
      el.setAttribute('title', '💡 Nhấp đúp chuột để chỉnh sửa số trực tiếp');
      el.style.cursor = 'pointer';

      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.startInlineEdit(el, idx, type, step);
      });
    });
  }

  startInlineEdit(targetEl, itemIndex, type, step) {
    // Nếu đang trong quá trình chỉnh sửa thì bỏ qua
    if (targetEl.querySelector('.inline-edit-input')) return;

    let currentVal = parseInt(targetEl.textContent.trim(), 10);
    if (isNaN(currentVal)) {
      // Lấy từ step data
      if (type === 'stack' && step.stack?.[itemIndex]) currentVal = step.stack[itemIndex].value;
      else if (type === 'queue' && step.queue?.[itemIndex]) currentVal = step.queue[itemIndex].value;
      else if (type === 'deque' && step.deque?.[itemIndex]) currentVal = step.deque[itemIndex].value;
      else if (step.nodes?.[itemIndex]) currentVal = step.nodes[itemIndex].value;
      else currentVal = 50;
    }

    const originalContent = targetEl.innerHTML;
    targetEl.innerHTML = '';

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.max = '99';
    input.value = currentVal;
    input.className = 'inline-edit-input';
    input.style.width = '42px';
    input.style.textAlign = 'center';
    input.style.fontSize = '14px';
    input.style.fontWeight = 'bold';
    input.style.border = '2px solid var(--primary)';
    input.style.borderRadius = '4px';
    input.style.background = 'var(--bg-surface)';
    input.style.color = 'var(--text-main)';
    input.style.outline = 'none';

    targetEl.appendChild(input);
    input.focus();
    input.select();

    const commitChange = () => {
      let newVal = parseInt(input.value, 10);
      if (isNaN(newVal) || newVal < 1) newVal = 1;
      if (newVal > 99) newVal = 99;

      this.applyInlineValueChange(type, itemIndex, newVal, step);
      soundFX.playTone(newVal);
      this.ui?.showFeedback(`✓ Đã sửa giá trị thành [${newVal}] thành công!`);
    };

    const cancelChange = () => {
      targetEl.innerHTML = originalContent;
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        commitChange();
      } else if (e.key === 'Escape') {
        cancelChange();
      }
    });

    input.addEventListener('blur', () => {
      commitChange();
    });
  }

  applyInlineValueChange(type, itemIndex, newVal, step) {
    const currStep = state.getCurrentStep();
    if (!currStep) return;

    if (type === 'stack' && currStep.stack && currStep.stack[itemIndex]) {
      currStep.stack[itemIndex].value = newVal;
    } else if (type === 'queue' && currStep.queue && currStep.queue[itemIndex]) {
      currStep.queue[itemIndex].value = newVal;
    } else if (type === 'deque' && currStep.deque && currStep.deque[itemIndex]) {
      currStep.deque[itemIndex].value = newVal;
    } else if (currStep.nodes && currStep.nodes[itemIndex]) {
      currStep.nodes[itemIndex].value = newVal;
    }

    // Cập nhật lại giao diện
    state.notify('stepChange');
  }

  /* ==========================================================================
     2. KHAY GẮP THẢ VẬT LÝ (DRAGGABLE ITEM DOCK) & THÙNG RÁC LIFO/FIFO
     ========================================================================== */

  setupPhysicalSandboxDock(type, step) {
    const canvas = document.getElementById('visualizer-canvas');
    if (!canvas) return;

    // Kiểm tra xem đã có dock chưa
    let dockWrapper = canvas.querySelector('.linear-sandbox-dock-wrapper');
    if (!dockWrapper) {
      dockWrapper = document.createElement('div');
      dockWrapper.className = 'linear-sandbox-dock-wrapper';
      canvas.appendChild(dockWrapper);
    }

    dockWrapper.innerHTML = `
      <div class="linear-dock-container">
        <div class="linear-dock-label">
          <span>📦 Khay gạch số kéo thả:</span>
          <span style="font-size: 11px; opacity: 0.7;">(Kéo thả số vào cấu trúc hoặc kéo ra thùng rác 🗑️)</span>
        </div>
        <div class="linear-dock-tiles">
          <div class="linear-drag-tile" draggable="true" data-val="15">15</div>
          <div class="linear-drag-tile" draggable="true" data-val="28">28</div>
          <div class="linear-drag-tile" draggable="true" data-val="42">42</div>
          <div class="linear-drag-tile" draggable="true" data-val="67">67</div>
          <div class="linear-drag-tile" draggable="true" data-val="89">89</div>
          <div class="linear-dock-custom-creator">
            <input type="number" id="dock-custom-num" min="1" max="99" value="50" style="width: 44px; text-align: center; border-radius: 4px; border: 1px solid var(--border-subtle); background: var(--bg-surface); color: var(--text-main);">
            <div class="linear-drag-tile is-custom" id="dock-custom-tile" draggable="true" data-val="50">➕ Kéo</div>
          </div>
        </div>
      </div>
      <div class="linear-trash-zone" id="linear-trash-zone">
        <div class="trash-icon">🗑️</div>
        <div class="trash-label">Thùng Rác Thu Hồi<br><span style="font-size: 10px; opacity: 0.7;">(Kéo phần tử thả vào đây)</span></div>
      </div>
    `;

    // Cập nhật giá trị custom tile khi input thay đổi
    const customNumInput = dockWrapper.querySelector('#dock-custom-num');
    const customTile = dockWrapper.querySelector('#dock-custom-tile');
    if (customNumInput && customTile) {
      customNumInput.addEventListener('input', () => {
        const val = parseInt(customNumInput.value, 10) || 50;
        customTile.setAttribute('data-val', val);
        customTile.textContent = val;
      });
    }

    // Gắn sự kiện dragstart cho các khối số trong dock
    const tiles = dockWrapper.querySelectorAll('.linear-drag-tile');
    tiles.forEach(tile => {
      tile.addEventListener('dragstart', (e) => {
        const val = tile.getAttribute('data-val') || '50';
        e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'dock', value: parseInt(val, 10) }));
        tile.classList.add('is-dragging');
        soundFX.playTone(30);
      });
      tile.addEventListener('dragend', () => {
        tile.classList.remove('is-dragging');
      });
    });

    // 2.2. Thiết lập Drop Zones cho Cấu Trúc Dữ Liệu
    this.bindStructureDropZones(type, canvas);

    // 2.3. Thiết lập draggable cho các phần tử bên trong cấu trúc và Drop Zone Thùng rác
    this.bindInternalItemsDragAndTrash(type, step, canvas, dockWrapper);
  }

  bindStructureDropZones(type, canvas) {
    if (type === 'stack') {
      const tube = canvas.querySelector('.stack-tube');
      if (!tube) return;
      this.attachDropTarget(tube, (dragData) => {
        if (dragData.source === 'dock') {
          const input = document.getElementById('linear-input-val');
          if (input) input.value = dragData.value;
          this.ui?.handleStackPush();
          this.triggerSuccessAnimation(tube);
        }
      }, 'Thả vào đây để Push vào Stack 📥');
    } else if (type === 'queue') {
      const channel = canvas.querySelector('.queue-channel');
      if (!channel) return;
      this.attachDropTarget(channel, (dragData) => {
        if (dragData.source === 'dock') {
          const input = document.getElementById('linear-input-val');
          if (input) input.value = dragData.value;
          this.ui?.handleQueueEnqueue();
          this.triggerSuccessAnimation(channel);
        }
      }, 'Thả vào đây để Enqueue vào Queue 📥');
    } else if (type === 'deque') {
      const tube = canvas.querySelector('.deque-tube');
      if (!tube) return;
      this.attachDropTarget(tube, (dragData, e) => {
        if (dragData.source === 'dock') {
          const rect = tube.getBoundingClientRect();
          const isLeftHalf = (e.clientX - rect.left) < (rect.width / 2);
          const input = document.getElementById('deque-input-val');
          if (input) input.value = dragData.value;
          if (isLeftHalf) {
            this.ui?.handleDequePushFront();
          } else {
            this.ui?.handleDequePushBack();
          }
          this.triggerSuccessAnimation(tube);
        }
      }, 'Thả nửa trái: Push Front | Thả nửa phải: Push Back 📥');
    }
  }

  attachDropTarget(el, onDropCallback, hintText) {
    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      el.classList.add('drop-target-active');
    });

    el.addEventListener('dragleave', () => {
      el.classList.remove('drop-target-active');
    });

    el.addEventListener('drop', (e) => {
      e.preventDefault();
      el.classList.remove('drop-target-active');
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) {
          const data = JSON.parse(raw);
          onDropCallback(data, e);
        }
      } catch (err) {
        console.error('Lỗi khi drop:', err);
      }
    });
  }

  bindInternalItemsDragAndTrash(type, step, canvas, dockWrapper) {
    const trashZone = dockWrapper.querySelector('#linear-trash-zone');
    if (!trashZone) return;

    // Gắn draggable cho các phần tử bên trong cấu trúc
    if (type === 'stack') {
      const items = canvas.querySelectorAll('.stack-item');
      const topIdx = step.top;
      items.forEach((itemEl, idx) => {
        itemEl.setAttribute('draggable', 'true');
        itemEl.addEventListener('dragstart', (e) => {
          const isTop = (idx === topIdx);
          e.dataTransfer.setData('text/plain', JSON.stringify({
            source: 'stack-item',
            index: idx,
            isTop,
            value: step.stack?.[idx]?.value
          }));
          itemEl.classList.add('is-dragging');
        });
        itemEl.addEventListener('dragend', () => itemEl.classList.remove('is-dragging'));
      });
    } else if (type === 'queue') {
      const items = canvas.querySelectorAll('.queue-item');
      items.forEach((itemEl, idx) => {
        itemEl.setAttribute('draggable', 'true');
        itemEl.addEventListener('dragstart', (e) => {
          const isFront = (idx === 0);
          e.dataTransfer.setData('text/plain', JSON.stringify({
            source: 'queue-item',
            index: idx,
            isFront,
            value: step.queue?.[idx]?.value
          }));
          itemEl.classList.add('is-dragging');
        });
        itemEl.addEventListener('dragend', () => itemEl.classList.remove('is-dragging'));
      });
    } else if (type === 'deque') {
      const items = canvas.querySelectorAll('.deque-item');
      const total = items.length;
      items.forEach((itemEl, idx) => {
        itemEl.setAttribute('draggable', 'true');
        itemEl.addEventListener('dragstart', (e) => {
          const isFront = (idx === 0);
          const isRear = (idx === total - 1);
          e.dataTransfer.setData('text/plain', JSON.stringify({
            source: 'deque-item',
            index: idx,
            isFront,
            isRear,
            value: step.deque?.[idx]?.value
          }));
          itemEl.classList.add('is-dragging');
        });
        itemEl.addEventListener('dragend', () => itemEl.classList.remove('is-dragging'));
      });
    }

    // Drop vào Thùng Rác: Kiểm tra quy tắc LIFO / FIFO
    this.attachDropTarget(trashZone, (dragData) => {
      if (type === 'stack' && dragData.source === 'stack-item') {
        if (dragData.isTop) {
          this.ui?.handleStackPop();
          this.triggerSuccessAnimation(trashZone);
          this.ui?.showFeedback('✓ Đã Pop() phần tử ở ĐỈNH (TOP) vào thùng rác!');
        } else {
          // Vi phạm LIFO
          soundFX.playSwap(20, 10);
          trashZone.classList.add('shake-error');
          setTimeout(() => trashZone.classList.remove('shake-error'), 600);
          this.ui?.showFeedback('⛔ Vi phạm nguyên lý LIFO (Last-In First-Out)! Chỉ được lấy phần tử ở ĐỈNH (TOP) của Ngăn xếp!', true);
        }
      } else if (type === 'queue' && dragData.source === 'queue-item') {
        if (dragData.isFront) {
          this.ui?.handleQueueDequeue();
          this.triggerSuccessAnimation(trashZone);
          this.ui?.showFeedback('✓ Đã Dequeue() phần tử ở ĐẦU (FRONT) vào thùng rác!');
        } else {
          // Vi phạm FIFO
          soundFX.playSwap(20, 10);
          trashZone.classList.add('shake-error');
          setTimeout(() => trashZone.classList.remove('shake-error'), 600);
          this.ui?.showFeedback('⛔ Vi phạm nguyên lý FIFO (First-In First-Out)! Chỉ được lấy phần tử ở ĐẦU (FRONT) của Hàng đợi!', true);
        }
      } else if (type === 'deque' && dragData.source === 'deque-item') {
        if (dragData.isFront) {
          this.ui?.handleDequePopFront();
          this.triggerSuccessAnimation(trashZone);
          this.ui?.showFeedback('✓ Đã Pop Front() phần tử vào thùng rác!');
        } else if (dragData.isRear) {
          this.ui?.handleDequePopBack();
          this.triggerSuccessAnimation(trashZone);
          this.ui?.showFeedback('✓ Đã Pop Back() phần tử vào thùng rác!');
        } else {
          soundFX.playSwap(20, 10);
          trashZone.classList.add('shake-error');
          setTimeout(() => trashZone.classList.remove('shake-error'), 600);
          this.ui?.showFeedback('⛔ Vi phạm nguyên lý Deque! Chỉ được lấy phần tử ở 2 đầu (Front hoặc Rear)!', true);
        }
      }
    });
  }

  triggerSuccessAnimation(el) {
    el.classList.add('action-success-pulse');
    setTimeout(() => el.classList.remove('action-success-pulse'), 500);
  }

  /* ==========================================================================
     3. SANDBOX TỰ DO & CẮT ✂️ / NỐI 🔗 DÂY CHO LINKED LISTS
     ========================================================================== */

  setupLinkedListSandbox(type, step) {
    const canvas = document.getElementById('visualizer-canvas');
    if (!canvas) return;

    // 3.1. Thêm thanh chuyển đổi chế độ Sandbox
    let modeBar = canvas.querySelector('.ll-sandbox-mode-bar');
    if (!modeBar) {
      modeBar = document.createElement('div');
      modeBar.className = 'll-sandbox-mode-bar';
      canvas.insertBefore(modeBar, canvas.firstChild);
    }

    modeBar.innerHTML = `
      <div class="ll-mode-buttons">
        <button class="btn btn-sm ${this.llMode === 'auto' ? 'btn-primary' : 'btn-secondary'}" id="btn-ll-mode-auto">📐 Bố cục Tự động</button>
        <button class="btn btn-sm ${this.llMode === 'freeform' ? 'btn-primary' : 'btn-secondary'}" id="btn-ll-mode-freeform">🛠️ Sandbox Kéo Tự Do</button>
        <button class="btn btn-sm ${this.llMode === 'puzzle' ? 'btn-primary' : 'btn-secondary'}" id="btn-ll-mode-puzzle">🧩 Đố Đảo Ngược (Puzzle)</button>
      </div>
      <div class="ll-sandbox-hints">
        ${this.llMode === 'auto' ? '<span>💡 Chế độ thẳng hàng tiêu chuẩn. Bấm [🛠️ Sandbox] để tự do kéo di chuyển và cắt/nối dây con trỏ!</span>' : ''}
        ${this.llMode === 'freeform' ? '<span>✋ Dùng chuột kéo Node di chuyển tự do. Bấm ✂️ trên dây để cắt, hoặc kéo từ chốt 🔗 để nối con trỏ mới!</span>' : ''}
        ${this.llMode === 'puzzle' ? '<span style="color: #f59e0b; font-weight: bold;">🎯 Hãy dùng kéo ✂️ và dây nối 🔗 để đảo ngược danh sách này sao cho ngược lại hoàn toàn!</span>' : ''}
      </div>
    `;

    modeBar.querySelector('#btn-ll-mode-auto')?.addEventListener('click', () => {
      this.llMode = 'auto';
      state.notify('stepChange');
    });

    modeBar.querySelector('#btn-ll-mode-freeform')?.addEventListener('click', () => {
      this.llMode = 'freeform';
      state.notify('stepChange');
    });

    modeBar.querySelector('#btn-ll-mode-puzzle')?.addEventListener('click', () => {
      this.llMode = 'puzzle';
      this.initReversePuzzle();
    });

    // Nếu đang ở chế độ Freeform hoặc Puzzle: Kích hoạt Drag & SVG links động
    if (this.llMode === 'freeform' || this.llMode === 'puzzle') {
      this.enableFreeformCanvas(canvas, type, step);
    }
  }

  enableFreeformCanvas(canvas, type, step) {
    const nodes = step.nodes || [];
    if (nodes.length === 0) return;

    const wrapper = canvas.querySelector('.ll-canvas-wrapper, .dll-canvas-wrapper, .cll-canvas-wrapper');
    if (!wrapper) return;

    wrapper.classList.add('is-freeform-active');

    // Tạo SVG Overlay chuyên dụng để vẽ dây nối động và kéo cắt
    let svgOverlay = wrapper.querySelector('.ll-dynamic-svg-overlay');
    if (!svgOverlay) {
      svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgOverlay.setAttribute('class', 'll-dynamic-svg-overlay');
      wrapper.appendChild(svgOverlay);
    }
    svgOverlay.innerHTML = '';

    // Khởi tạo tọa độ cho từng node nếu chưa có
    const rect = wrapper.getBoundingClientRect();
    const startX = 60;
    const startY = 110;
    const spacingX = 140;

    nodes.forEach((node, idx) => {
      if (!this.nodePositions.has(node.id)) {
        this.nodePositions.set(node.id, {
          x: startX + idx * spacingX,
          y: startY + (idx % 2 === 1 ? 30 : -10)
        });
      }
    });

    // Định vị các thẻ Node Card theo tọa độ
    const cards = wrapper.querySelectorAll('.ll-node-card, .dll-node-card');
    cards.forEach((card, idx) => {
      const node = nodes[idx];
      if (!node) return;
      const pos = this.nodePositions.get(node.id);
      if (pos) {
        card.style.position = 'absolute';
        card.style.left = `${pos.x}px`;
        card.style.top = `${pos.y}px`;
        card.style.cursor = 'grab';
      }

      // Thêm chốt Nối Dây (Port 🔗) trên khoang Next
      let nextPort = card.querySelector('.ll-port-connector');
      if (!nextPort) {
        nextPort = document.createElement('div');
        nextPort.className = 'll-port-connector';
        nextPort.title = 'Kéo từ chốt này để nối con trỏ Next sang Node khác 🔗';
        nextPort.innerHTML = '●';
        const nextBox = card.querySelector('.ll-node-next, .dll-node-next');
        if (nextBox) nextBox.appendChild(nextPort);
      }

      // Gắn sự kiện kéo dây nối từ chốt
      nextPort.onpointerdown = (e) => {
        e.stopPropagation();
        this.startDrawingLink(node.id, e, wrapper, svgOverlay);
      };

      // Gắn sự kiện di chuyển node
      card.onpointerdown = (e) => {
        if (e.target.closest('.ll-port-connector') || e.target.closest('.inline-edit-input')) return;
        this.startDragNode(node.id, e, card, wrapper, svgOverlay, nodes);
      };
    });

    // Vẽ toàn bộ các dây liên kết SVG động giữa các node
    this.redrawDynamicLinks(wrapper, svgOverlay, nodes, type);

    // Nếu ở chế độ Puzzle: Thêm nút Kiểm tra đáp án
    if (this.llMode === 'puzzle') {
      this.renderPuzzleControls(canvas, nodes);
    }
  }

  startDragNode(nodeId, e, cardEl, wrapper, svgOverlay, nodes) {
    this.activeDragNode = nodeId;
    const cardRect = cardEl.getBoundingClientRect();
    this.dragOffset = {
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top
    };
    cardEl.style.cursor = 'grabbing';
    cardEl.classList.add('is-node-dragging');

    const onPointerMove = (moveEvent) => {
      if (!this.activeDragNode) return;
      const wrapperRect = wrapper.getBoundingClientRect();
      const newX = Math.max(10, Math.min(wrapperRect.width - 120, moveEvent.clientX - wrapperRect.left - this.dragOffset.x));
      const newY = Math.max(10, Math.min(wrapperRect.height - 90, moveEvent.clientY - wrapperRect.top - this.dragOffset.y));

      this.nodePositions.set(nodeId, { x: newX, y: newY });
      cardEl.style.left = `${newX}px`;
      cardEl.style.top = `${newY}px`;

      this.redrawDynamicLinks(wrapper, svgOverlay, nodes, 'linkedList');
    };

    const onPointerUp = () => {
      this.activeDragNode = null;
      cardEl.style.cursor = 'grab';
      cardEl.classList.remove('is-node-dragging');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  redrawDynamicLinks(wrapper, svgOverlay, nodes, type) {
    svgOverlay.innerHTML = '';

    // Marker mũi tên nhọn
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="arrow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#3b82f6" />
      </marker>
      <marker id="arrow-head-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#ef4444" />
      </marker>
    `;
    svgOverlay.appendChild(defs);

    nodes.forEach((node) => {
      if (!node.nextId) return;
      const targetNode = nodes.find(n => n.id === node.nextId);
      if (!targetNode) return;

      const p1 = this.nodePositions.get(node.id);
      const p2 = this.nodePositions.get(targetNode.id);
      if (!p1 || !p2) return;

      // Tâm của 2 node
      const x1 = p1.x + 95;
      const y1 = p1.y + 36;
      const x2 = p2.x + 10;
      const y2 = p2.y + 36;

      // Vẽ đường cong Bezier
      const dx = x2 - x1;
      const dy = y2 - y1;
      const cx1 = x1 + dx * 0.4;
      const cy1 = y1;
      const cx2 = x1 + dx * 0.6;
      const cy2 = y2;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`);
      path.setAttribute('class', 'll-dynamic-path');
      path.setAttribute('marker-end', 'url(#arrow-head)');
      svgOverlay.appendChild(path);

      // Thêm nút Cắt Kéo ✂️ ngay giữa dây
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const cutBtn = document.createElement('div');
      cutBtn.className = 'll-cut-scissor-btn';
      cutBtn.innerHTML = '✂️';
      cutBtn.title = `Cắt đứt liên kết giữa Node(${node.value}) và Node(${targetNode.value})`;
      cutBtn.style.left = `${midX - 12}px`;
      cutBtn.style.top = `${midY - 12}px`;

      cutBtn.onclick = (e) => {
        e.stopPropagation();
        this.cutLink(node, targetNode);
      };

      wrapper.appendChild(cutBtn);
    });
  }

  cutLink(fromNode, toNode) {
    fromNode.nextId = null;
    soundFX.playSwap(70, 20);
    this.ui?.showFeedback(`✂️ Đã cắt đứt liên kết từ Node(${fromNode.value}) tới Node(${toNode.value})!`);
    state.notify('stepChange');
  }

  startDrawingLink(fromNodeId, e, wrapper, svgOverlay) {
    this.connectingSourceNodeId = fromNodeId;
    const wrapperRect = wrapper.getBoundingClientRect();

    const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tempPath.setAttribute('class', 'll-temp-connecting-path');
    tempPath.setAttribute('marker-end', 'url(#arrow-head)');
    svgOverlay.appendChild(tempPath);

    const fromPos = this.nodePositions.get(fromNodeId);
    const startX = (fromPos ? fromPos.x : 0) + 95;
    const startY = (fromPos ? fromPos.y : 0) + 36;

    const onPointerMove = (moveEvt) => {
      const curX = moveEvt.clientX - wrapperRect.left;
      const curY = moveEvt.clientY - wrapperRect.top;
      tempPath.setAttribute('d', `M ${startX} ${startY} Q ${(startX + curX) / 2} ${(startY + curY) / 2 - 20} ${curX} ${curY}`);
    };

    const onPointerUp = (upEvt) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      tempPath.remove();

      // Kiểm tra xem thả chuột vào Node nào
      const targetCard = document.elementFromPoint(upEvt.clientX, upEvt.clientY)?.closest('.ll-node-card, .dll-node-card');
      if (targetCard) {
        const currStep = state.getCurrentStep();
        const nodes = currStep?.nodes || [];
        const cardIndex = Array.from(wrapper.querySelectorAll('.ll-node-card, .dll-node-card')).indexOf(targetCard);
        const targetNode = nodes[cardIndex];

        if (targetNode && targetNode.id !== fromNodeId) {
          const fromNode = nodes.find(n => n.id === fromNodeId);
          if (fromNode) {
            fromNode.nextId = targetNode.id;
            soundFX.playVictory([{ value: 40 }, { value: 70 }]);
            this.ui?.showFeedback(`🔗 Đã nối liên kết: Node(${fromNode.value}) ➔ Node(${targetNode.value})!`);
            state.notify('stepChange');
          }
        }
      }
      this.connectingSourceNodeId = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  /* ==========================================================================
     4. CHẾ ĐỘ THỬ THÁCH ĐẢO NGƯỢC (REVERSE PUZZLE)
     ========================================================================== */

  initReversePuzzle() {
    // Tạo 4 node mẫu ban đầu: 15 -> 30 -> 45 -> 60 -> null
    const puzzleNodes = [
      { id: 'p-1', value: 15, nextId: 'p-2' },
      { id: 'p-2', value: 30, nextId: 'p-3' },
      { id: 'p-3', value: 45, nextId: 'p-4' },
      { id: 'p-4', value: 60, nextId: null }
    ];

    this.nodePositions.clear();
    puzzleNodes.forEach((node, i) => {
      this.nodePositions.set(node.id, { x: 70 + i * 140, y: 100 });
    });

    const step = {
      linearType: 'linkedList',
      nodes: puzzleNodes,
      pointers: { head: 'p-1', tail: 'p-4' },
      activeAction: 'puzzle_init',
      message: '🧩 [THỬ THÁCH ĐẢO NGƯỢC]: Hãy dùng Kéo ✂️ và Dây Nối 🔗 để đảo ngược danh sách này sao cho HEAD là Node(60) ➔ 45 ➔ 30 ➔ 15 ➔ NULL!',
      isLinear: true
    };

    state.steps = [step];
    state.currentStepIndex = 0;
    state.notify('stepChange');
  }

  renderPuzzleControls(canvas, nodes) {
    let puzzleControl = canvas.querySelector('.ll-puzzle-control-panel');
    if (!puzzleControl) {
      puzzleControl = document.createElement('div');
      puzzleControl.className = 'll-puzzle-control-panel';
      canvas.appendChild(puzzleControl);
    }

    puzzleControl.innerHTML = `
      <div class="puzzle-goal-banner">
        <span>🎯 Mục tiêu: Đảo ngược thành <strong>[60] ➔ [45] ➔ [30] ➔ [15] ➔ NULL</strong></span>
        <button class="btn btn-primary btn-sm" id="btn-check-puzzle-solution">✔️ Kiểm tra đáp án</button>
      </div>
    `;

    puzzleControl.querySelector('#btn-check-puzzle-solution')?.addEventListener('click', () => {
      this.checkReversePuzzleSolution(nodes);
    });
  }

  checkReversePuzzleSolution(nodes) {
    // Duyệt từ node có value 60
    const node60 = nodes.find(n => n.value === 60);
    const node45 = nodes.find(n => n.value === 45);
    const node30 = nodes.find(n => n.value === 30);
    const node15 = nodes.find(n => n.value === 15);

    const isCorrect = (
      node60 && node60.nextId === node45?.id &&
      node45 && node45.nextId === node30?.id &&
      node30 && node30.nextId === node15?.id &&
      node15 && node15.nextId === null
    );

    if (isCorrect) {
      soundFX.playVictory([{ value: 30 }, { value: 60 }, { value: 90 }]);
      this.ui?.openVictoryModal({
        elapsedSeconds: 45,
        accuracy: 100,
        correctCount: 4,
        wrongCount: 0
      });
      this.ui?.showFeedback('🎉 XUẤT SẮC! Bạn đã tự tay đảo ngược hoàn chỉnh 100% Danh sách liên kết!');
    } else {
      soundFX.playSwap(30, 20);
      this.ui?.showFeedback('❌ Chưa chính xác! Hãy kiểm tra lại các liên kết: 60 phải trỏ về 45, 45 về 30, 30 về 15, và 15 trỏ về NULL.', true);
    }
  }

  bindGlobalPointerEvents() {
    // Xử lý các sự kiện toàn cục nếu cần
  }
}

export const linearInteractive = new LinearInteractiveManager();
