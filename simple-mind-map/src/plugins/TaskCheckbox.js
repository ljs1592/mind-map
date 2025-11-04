import { simpleDeepClone, walk, createUid } from '../utils'

/**
 * 任务勾选框插件
 * 支持节点的任务勾选功能，父节点会显示子节点的完成度
 * 
 * 功能特性：
 * 1. 叶子节点显示勾选框（□/✓），父节点显示圆形完成度
 * 2. 叶子节点点击切换状态，自动递归更新所有祖先节点
 * 3. 父节点圆形框点击：<100%设为100%并递归完成所有子节点，=100%设为0%并递归重置所有子节点
 * 4. 支持过滤功能：显示所有/仅未完成/仅已完成任务
 * 5. 支持动画效果和hover提示
 */
class TaskCheckbox {
  constructor({ mindMap }) {
    this.mindMap = mindMap
    this.checkboxSize = 18
    this.checkboxMargin = 8
    
    // 从配置项读取任务视图设置
    this.viewEnabled = this.mindMap.opt.taskCheckboxViewEnabled !== false
    this.viewModes = this.initViewModes(
      Array.isArray(this.mindMap.opt.taskCheckboxViewModes)
        ? this.mindMap.opt.taskCheckboxViewModes
        : null
    )
    
    // 设置默认视图模式
    const defaultMode = this.mindMap.opt.taskCheckboxDefaultViewMode || 'all'
    this.filterMode = this.viewModes.includes(defaultMode) ? defaultMode : this.viewModes[0]
    this.viewModeIndex = this.viewModes.indexOf(this.filterMode)
    if (this.viewModeIndex < 0) {
      this.viewModeIndex = 0
      this.filterMode = this.viewModes[0]
    }
    
    // 从配置项读取动画参数
    this.animationDelay = this.mindMap.opt.taskCheckboxAnimationDelay || 550
    this.animationDuration = this.mindMap.opt.taskCheckboxAnimationDuration || 300
    this.animationMoveDistance = this.mindMap.opt.taskCheckboxAnimationMoveDistance || 30
    this.exitAnimationEasing = this.mindMap.opt.taskCheckboxExitAnimationEasing || '>'
    this.enterAnimationEasing = this.mindMap.opt.taskCheckboxEnterAnimationEasing || '<'
    this.currentViewData = null
    this.fullDataCache = null
    this.uidToOriginalData = new Map()
    this.virtualRootUid = null
    this.isUsingVirtualView = false
    this.currentVisibleUidSet = new Set()
    this.pendingEnterUids = new Set()
    this.renderedNodeMap = new Map()
    this.isLockingInteraction = false
    this.cachedBeforeTextEdit = null
    this.cachedReadonly = null
    
    // 用于跟踪节点的上一次状态，避免重复播放动画
    // key: node.uid, value: { checked: boolean, percentage: number }
    this.nodeStateCache = new Map()
    
    // 标志位：防止在 onNodeTreeRenderEnd 中循环触发渲染
    this.isUpdatingFromEvent = false
    
    // 绑定方法到当前实例，确保 this 上下文正确
    this.createCheckboxContent = this.createCheckboxContent.bind(this)
    this.handleBeforeShowTextEdit = this.handleBeforeShowTextEdit.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    
    // 设置 createNodePrefixContent 配置
    this.mindMap.opt.createNodePrefixContent = this.createCheckboxContent
    
    // 监听文本编辑前事件，防止点击勾选框时触发编辑
    this.mindMap.on('before_show_text_edit', this.handleBeforeShowTextEdit)
    
    // 当节点树渲染结束或数据变更后，刷新所有节点的前置勾选内容
    this.onNodeTreeRenderEnd = this.onNodeTreeRenderEnd.bind(this)
    this.mindMap.on('node_tree_render_end', this.onNodeTreeRenderEnd)
    // 仅作为兜底：某些数据更新触发但未引发布局变化时，仍保证刷新
    this.onDataChange = this.onDataChange.bind(this)
    this.mindMap.on('data_change', this.onDataChange)

    // 监听键盘事件，实现 Ctrl+F 快捷键
    document.addEventListener('keydown', this.handleKeyDown)
  }

  initViewModes(viewModes) {
    const availableModes = ['all', 'uncompleted', 'completed']
    const defaultModes = ['all', 'uncompleted', 'completed']
    if (!Array.isArray(viewModes) || viewModes.length === 0) {
      return defaultModes
    }
    const cleaned = viewModes
      .map(mode => {
        if (typeof mode !== 'string') return ''
        return mode.trim().toLowerCase()
      })
      .filter(mode => availableModes.includes(mode))

    const unique = cleaned.filter((mode, index) => {
      return cleaned.indexOf(mode) === index
    })

    if (unique.length === 0) {
      return defaultModes
    }

    const comboCandidates = [
      ['all', 'uncompleted', 'completed'],
      ['all', 'uncompleted'],
      ['all', 'completed']
    ]

    const matched = comboCandidates.find(candidate => {
      if (candidate.length !== unique.length) return false
      return candidate.every((mode, index) => mode === unique[index])
    })

    return matched || defaultModes
  }

  /**
   * 处理文本编辑前事件
   */
  handleBeforeShowTextEdit() {
    // 可以在这里添加逻辑，防止点击勾选框时触发文本编辑
  }

  /**
   * 处理键盘事件
   */
  handleKeyDown(e) {
    // Ctrl+F 切换过滤模式
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault()
      this.cycleFilterMode()
    }
  }

  /**
   * 插件被移除前调用的钩子
   */
  beforePluginRemove() {
    this.restoreInteractionLock()
    this.restoreOriginalView()
    // 清理状态缓存
    this.nodeStateCache.clear()
    
    // 移除事件监听
    this.mindMap.off('before_show_text_edit', this.handleBeforeShowTextEdit)
    this.mindMap.off('node_tree_render_end', this.onNodeTreeRenderEnd)
    this.mindMap.off('data_change', this.onDataChange)
    document.removeEventListener('keydown', this.handleKeyDown)
    
    // 清理配置
    this.mindMap.opt.createNodePrefixContent = null
  }

  /**
   * 插件被卸载前调用的钩子
   */
  beforePluginDestroy() {
    this.beforePluginRemove()
  }

  /**
   * 计算节点完成度
   * @param {Object} nodeData - 节点数据
   * @returns {Object} 完成度信息 { total, completed, percentage }
   * 
   * 计算规则：
   * - 叶子节点：✓=100%, □=0%
   * - 父节点：完成度 = (所有子节点完成度之和 / 子节点数) 
   *   即：平均所有子节点的完成度百分比
   */
  calculateCompletion(nodeData) {
    if (!nodeData.children || nodeData.children.length === 0) {
      // 叶子节点，根据自身的勾选状态
      const checked = nodeData.data && nodeData.data.taskChecked === true
      return {
        total: 1,
        completed: checked ? 1 : 0,
        percentage: checked ? 100 : 0
      }
    }

    // 有子节点，递归计算所有子节点的平均完成度
    let totalPercentage = 0
    let leafTotal = 0
    let leafCompleted = 0

    nodeData.children.forEach(child => {
      const childCompletion = this.calculateCompletion(child)
      totalPercentage += childCompletion.percentage
      leafTotal += childCompletion.total
      leafCompleted += childCompletion.completed
    })

    // 父节点完成度 = 所有子节点完成度的平均值
    const percentage = nodeData.children.length > 0 
      ? Math.round(totalPercentage / nodeData.children.length) 
      : 0

    // 缓存完成度信息到节点数据
    if (!nodeData.data) nodeData.data = {}
    nodeData.data._completion = { 
      total: leafTotal, 
      completed: leafCompleted, 
      percentage 
    }

    return { 
      total: leafTotal, 
      completed: leafCompleted, 
      percentage 
    }
  }

  /**
   * 创建勾选框内容（此方法会在每次节点渲染时被调用）
   * @param {Object} node - 节点实例
   * @returns {Object} 勾选框元素信息
   */
  createCheckboxContent(node) {
    const nodeData = node.nodeData
    const hasChildren = nodeData.children && nodeData.children.length > 0
    const checked = nodeData.data && nodeData.data.taskChecked === true
    this.renderedNodeMap.set(node.uid, node)
    
    // 在创建勾选框前先计算完成度
    let completion = { total: 0, completed: 0, percentage: 0 }
    if (hasChildren) {
      completion = this.calculateCompletion(nodeData)
    } else {
      completion = {
        total: 1,
        completed: checked ? 1 : 0,
        percentage: checked ? 100 : 0
      }
    }

    // 检查状态是否改变，决定是否播放动画
    const nodeUid = node.uid
    const prevState = this.nodeStateCache.get(nodeUid)
    let shouldAnimate = false
    
    if (!prevState) {
      // 首次渲染，不播放动画（节点可能本来就是完成状态）
      shouldAnimate = false
    } else {
      // 状态发生改变时才播放动画
      if (hasChildren) {
        // 父节点：检查完成度是否变为 100%
        shouldAnimate = prevState.percentage !== 100 && completion.percentage === 100
      } else {
        // 叶子节点：检查是否从未勾选变为勾选
        shouldAnimate = !prevState.checked && checked
      }
    }
    
    // 更新状态缓存（包括节点类型信息）
    this.nodeStateCache.set(nodeUid, {
      checked: checked,
      percentage: completion.percentage,
      wasParent: hasChildren
    })

    // 创建一个 div 容器
    const container = document.createElement('div')
    container.className = 'task-checkbox-container'
    container.style.width = this.checkboxSize + 'px'
    container.style.height = this.checkboxSize + 'px'
    container.style.display = 'inline-block'
    container.style.cursor = 'pointer'
    container.style.verticalAlign = 'top'
    container.style.marginRight = this.checkboxMargin + 'px'
    container.style.position = 'relative'
    container.style.flexShrink = '0'
    
    // 创建 SVG 元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', this.checkboxSize)
    svg.setAttribute('height', this.checkboxSize)
    svg.setAttribute('viewBox', `0 0 ${this.checkboxSize} ${this.checkboxSize}`)
    svg.style.display = 'block'
    svg.style.overflow = 'visible'
    
    if (hasChildren) {
      // 父节点：显示圆形进度
      this.renderProgressCircle(svg, completion.percentage, shouldAnimate)
    } else {
      // 叶子节点：显示勾选框
      this.renderCheckbox(svg, checked, shouldAnimate)
    }
    
    container.appendChild(svg)
    
    // 添加 hover 提示
    this.addTooltip(container, completion, hasChildren)
    
    // 添加点击事件
    container.addEventListener('click', (e) => {
      e.stopPropagation()
      this.toggleCheckbox(node)
    })

    // 添加右键菜单事件
    container.addEventListener('contextmenu', (e) => {
      e.stopPropagation()
      e.preventDefault()
      this.showFilterMenu(e)
    })

    // 返回符合 createNodePrefixContent 要求的对象格式
    return {
      el: container,
      width: this.checkboxSize + this.checkboxMargin,
      height: this.checkboxSize
    }
  }

  /**
   * 添加 hover 提示
   * @param {HTMLElement} container - 容器元素
   * @param {Object} completion - 完成度信息
   * @param {Boolean} hasChildren - 是否有子节点
   */
  addTooltip(container, completion, hasChildren) {
    const tooltipText = hasChildren 
      ? `完成度: ${completion.percentage}% (${completion.completed}/${completion.total})`
      : `状态: ${completion.percentage === 100 ? '已完成' : '未完成'}`
    
    container.title = tooltipText
    
    // 可选：添加自定义 tooltip 样式
    container.setAttribute('data-tooltip', tooltipText)
  }

  /**
   * 渲染勾选框（叶子节点）
   * @param {SVGElement} svg - SVG 容器元素
   * @param {Boolean} checked - 是否勾选
   * @param {Boolean} shouldAnimate - 是否播放动画
   */
  renderCheckbox(svg, checked, shouldAnimate = false) {
    const size = this.checkboxSize

    // 清空SVG内容
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild)
    }

    // 背景矩形
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', size)
    rect.setAttribute('height', size)
    rect.setAttribute('rx', 4)
    rect.setAttribute('ry', 4)
    rect.setAttribute('fill', checked ? '#3b82f6' : '#ffffff')
    rect.setAttribute('stroke', checked ? '#3b82f6' : '#cbd5e1')
    rect.setAttribute('stroke-width', 2)
    
    // 添加 CSS 过渡动画
    rect.style.transition = 'all 0.3s ease'

    svg.appendChild(rect)

    // 如果已勾选，添加对勾
    if (checked) {
      const checkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      checkPath.setAttribute('d', 'M4,9 L7,12 L14,5')
      checkPath.setAttribute('fill', 'none')
      checkPath.setAttribute('stroke', '#ffffff')
      checkPath.setAttribute('stroke-width', 2)
      checkPath.setAttribute('stroke-linecap', 'round')
      checkPath.setAttribute('stroke-linejoin', 'round')
      
      // 只有在状态改变时才添加动画
      if (shouldAnimate) {
        const pathLength = checkPath.getTotalLength ? checkPath.getTotalLength() : 20
        checkPath.style.strokeDasharray = pathLength
        checkPath.style.strokeDashoffset = pathLength
        checkPath.style.animation = 'checkmark 0.3s ease forwards'
        
        // 添加动画样式
        if (!document.getElementById('task-checkbox-animations')) {
          const style = document.createElement('style')
          style.id = 'task-checkbox-animations'
          style.textContent = `
            @keyframes checkmark {
              to {
                stroke-dashoffset: 0;
              }
            }
          `
          document.head.appendChild(style)
        }
      }
      
      svg.appendChild(checkPath)
    }
  }

  /**
   * 渲染进度圆圈（父节点）
   * @param {SVGElement} svg - SVG 容器元素
   * @param {Number} percentage - 完成百分比
   * @param {Boolean} shouldAnimate - 是否播放动画
   */
  renderProgressCircle(svg, percentage, shouldAnimate = false) {
    const size = this.checkboxSize
    const radius = size / 2 - 2
    const center = size / 2
    const circumference = 2 * Math.PI * radius

    // 清空SVG内容
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild)
    }

    // 背景圆圈
    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    bgCircle.setAttribute('cx', center)
    bgCircle.setAttribute('cy', center)
    bgCircle.setAttribute('r', radius)
    bgCircle.setAttribute('fill', 'none')
    bgCircle.setAttribute('stroke', '#e2e8f0')
    bgCircle.setAttribute('stroke-width', 2)

    svg.appendChild(bgCircle)

    // 进度圆圈（顺时针填充）
    if (percentage > 0) {
      const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      progressCircle.setAttribute('cx', center)
      progressCircle.setAttribute('cy', center)
      progressCircle.setAttribute('r', radius)
      progressCircle.setAttribute('fill', 'none')
      progressCircle.setAttribute('stroke', percentage === 100 ? '#10b981' : '#3b82f6')
      progressCircle.setAttribute('stroke-width', 2)
      progressCircle.setAttribute('stroke-linecap', 'round')
      progressCircle.setAttribute('stroke-dasharray', circumference)
      progressCircle.setAttribute('stroke-dashoffset', circumference * (1 - percentage / 100))
      progressCircle.setAttribute('transform', `rotate(-90 ${center} ${center})`)
      
      // 添加顺时针填充动画
      progressCircle.style.transition = 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease'

      svg.appendChild(progressCircle)
    }

    // 完成时显示对勾
    if (percentage === 100) {
      const checkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      // 使用相对于 center 的坐标，确保对勾清晰可见
      // 对勾从左下到中间再到右上
      checkPath.setAttribute('d', `M${center - 4},${center} L${center - 1},${center + 3} L${center + 4},${center - 3}`)
      checkPath.setAttribute('fill', 'none')
      checkPath.setAttribute('stroke', '#10b981')
      checkPath.setAttribute('stroke-width', 2)
      checkPath.setAttribute('stroke-linecap', 'round')
      checkPath.setAttribute('stroke-linejoin', 'round')
      
      // 只有在状态改变时才添加动画
      if (shouldAnimate) {
        const pathLength = checkPath.getTotalLength ? checkPath.getTotalLength() : 20
        checkPath.style.strokeDasharray = pathLength
        checkPath.style.strokeDashoffset = pathLength
        checkPath.style.animation = 'checkmark 0.3s ease 0.2s forwards'
        
        // 确保动画样式存在
        if (!document.getElementById('task-checkbox-animations')) {
          const style = document.createElement('style')
          style.id = 'task-checkbox-animations'
          style.textContent = `
            @keyframes checkmark {
              to {
                stroke-dashoffset: 0;
              }
            }
          `
          document.head.appendChild(style)
        }
      }
      
      svg.appendChild(checkPath)
    }
  }

  /**
   * 切换勾选框状态
   * @param {Object} node - 节点实例
   * 
   * 交互逻辑：
   * - 叶子节点：切换自身状态（□ ⇄ ✓），然后递归更新所有祖先节点
   * - 父节点：
   *   - 如果完成度 < 100%，点击后设为 100%，递归将所有子节点设为已完成（✓）
   *   - 如果完成度 = 100%，点击后设为 0%，递归将所有子节点设为未完成（□）
   */
  toggleCheckbox(node) {
    const nodeData = node.nodeData
    const hasChildren = nodeData.children && nodeData.children.length > 0

    if (this.filterMode !== 'all' && this.fullDataCache) {
      this.toggleCheckboxInVirtualView(node, hasChildren)
      return
    }

    if (!hasChildren) {
      // 叶子节点：切换自身状态
      const newState = !(nodeData.data && nodeData.data.taskChecked)
      this.mindMap.execCommand('SET_NODE_DATA', node, {
        taskChecked: newState
      })
    } else {
      // 父节点：根据当前完成度决定是全部勾选还是全部取消
      const completion = this.calculateCompletion(nodeData)
      const newState = completion.percentage < 100
      
      // 递归设置所有后代叶子节点的状态
      this.setAllChildrenState(node, newState)
    }

    // 立即重新渲染整棵树以更新所有勾选框
    // 延迟一小段时间确保数据命令已执行完成
    setTimeout(() => {
      this.reRenderTree()
    }, 10)
  }

  toggleCheckboxInVirtualView(node, hasChildren) {
    const nodeUid = node.nodeData.data && node.nodeData.data.uid
    if (!nodeUid) return
    const sourceNode = this.uidToOriginalData.get(nodeUid)
    if (!sourceNode) return

    // 第一步：先预览性地更新勾选框视觉效果（触发勾选动画）
    if (!hasChildren) {
      const current = node.nodeData.data && node.nodeData.data.taskChecked === true
      this.mindMap.execCommand('SET_NODE_DATA', node, {
        taskChecked: !current
      })
    } else {
      const completion = this.calculateCompletion(node.nodeData)
      const targetState = completion.percentage < 100
      this.setAllChildrenState(node, targetState)
    }

    // 立即重新渲染勾选框（触发打勾动画）
    setTimeout(() => {
      this.reRenderTree()
    }, 10)

    // 第二步：在后台准备数据变更
    if (!hasChildren) {
      const current = sourceNode.data && sourceNode.data.taskChecked === true
      sourceNode.data = sourceNode.data || {}
      sourceNode.data.taskChecked = !current
    } else {
      const completion = this.calculateCompletion(sourceNode)
      const targetState = completion.percentage < 100
      this.setAllDataChildrenState(sourceNode, targetState)
    }

    this.recalculateAllCompletion(this.fullDataCache)
    this.refreshUidMap()
    const previousVisible = new Set(this.currentVisibleUidSet)
    const viewData = this.buildViewData(this.filterMode)
    if (!viewData) return
    const nextVisiblePreview = this.collectVisibleUids(viewData)
    const removed = [...previousVisible].filter(
      uid => !nextVisiblePreview.has(uid)
    )
    const added = [...nextVisiblePreview].filter(
      uid => !previousVisible.has(uid)
    )

    const needExitAnimation = removed.length > 0 &&
      (this.filterMode === 'uncompleted' || this.filterMode === 'completed')

    if (needExitAnimation) {
      // 等待勾选框动画完成后再开始节点退出动画
      setTimeout(() => {
        this.animateNodesExit(removed)
          .then(() => {
            if (added.length > 0) {
              this.pendingEnterUids = new Set(added)
            } else {
              this.pendingEnterUids.clear()
            }
            this.applyViewData(viewData, nextVisiblePreview)
          })
          .catch(() => {
            if (added.length > 0) {
              this.pendingEnterUids = new Set(added)
            } else {
              this.pendingEnterUids.clear()
            }
            this.applyViewData(viewData, nextVisiblePreview)
          })
      }, this.animationDelay)
    } else {
      if (added.length > 0) {
        this.pendingEnterUids = new Set(added)
      } else {
        this.pendingEnterUids.clear()
      }
      this.applyViewData(viewData, nextVisiblePreview)
    }
  }

  /**
   * 递归设置所有后代叶子节点的勾选状态
   * @param {Object} node - 节点实例
   * @param {Boolean} state - 目标状态
   */
  setAllChildrenState(node, state) {
    // 遍历所有子节点
    if (!node.children || node.children.length === 0) {
      return
    }
    
    const walk = (currentNode) => {
      const nodeData = currentNode.nodeData
      const hasChildren = nodeData && nodeData.children && nodeData.children.length > 0
      
      if (!hasChildren) {
        // 叶子节点，设置状态
        this.mindMap.execCommand('SET_NODE_DATA', currentNode, {
          taskChecked: state
        })
      } else {
        // 父节点，递归处理所有子节点
        if (currentNode.children && currentNode.children.length > 0) {
          currentNode.children.forEach(child => {
            walk(child)
          })
        }
      }
    }
    
    // 从当前节点的子节点开始遍历
    node.children.forEach(child => {
      walk(child)
    })
  }

  /**
   * 重新渲染整棵节点树
   */
  reRenderTree(requestRender = true) {
    if (!this.mindMap.renderer || !this.mindMap.renderer.root) {
      return
    }
    
    const root = this.mindMap.renderer.root
    
    // 先重新计算所有节点的完成度
    this.recalculateAllCompletion(root.nodeData)
    
    // 然后重新渲染所有勾选框
    const walk = (node) => {
      // 重新创建前置内容（勾选框）
      if (node && node.createNodeContents) {
        try {
          node.createNodeContents(['prefix'])
        } catch (e) {
          console.error('重新创建勾选框时出错:', e)
        }
      }
      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => walk(child))
      }
    }
    
    walk(root)
    
    // 触发完整渲染（可选）
    if (requestRender) {
      this.mindMap.render()
    }
  }

  /**
   * 递归重新计算所有节点的完成度
   * @param {Object} nodeData - 节点数据
   */
  recalculateAllCompletion(nodeData) {
    if (!nodeData) return
    
    // 先递归计算所有子节点
    if (nodeData.children && nodeData.children.length > 0) {
      nodeData.children.forEach(child => {
        this.recalculateAllCompletion(child)
      })
    }
    
    // 然后计算当前节点
    this.calculateCompletion(nodeData)
  }

  /**
   * 节点树渲染完成后的回调：
   * 用于在新增/删除/移动节点导致的结构变化后，
   * 刷新所有节点的前置勾选内容与完成度显示。
   * 
   * 策略：
   * 1. 重新计算所有节点的完成度
   * 2. 手动更新所有勾选框的显示（不重新创建DOM）
   * 3. 如果节点类型发生变化（父节点↔叶子节点），需要重新创建前置内容
   */
  onNodeTreeRenderEnd() {
    if (!this.mindMap.renderer || !this.mindMap.renderer.root || this.isUpdatingFromEvent) {
      return
    }
    
    this.isUpdatingFromEvent = true
    
    try {
      // 重新计算所有节点的完成度
      this.recalculateAllCompletion(this.mindMap.renderer.root.nodeData)
      
      // 检查是否有节点类型发生变化（需要完整重建）
      let needFullRebuild = false
      
      // 遍历所有节点，手动更新勾选框显示
      const updateCheckboxDisplay = (node) => {
        if (!node) return
        
        // 如果节点没有前置内容，标记需要完整重建
        if (!node._prefixData || !node._prefixData.el) {
          needFullRebuild = true
          if (node.children && node.children.length > 0) {
            node.children.forEach(child => updateCheckboxDisplay(child))
          }
          return
        }
        
        const nodeData = node.nodeData
        const hasChildren = nodeData.children && nodeData.children.length > 0
        
        // 获取节点的上一次状态（用于判断是否从父节点变为叶子节点）
        const prevState = this.nodeStateCache.get(node.uid)
        
        // 检查节点类型是否发生变化
        const wasParentNode = prevState && prevState.wasParent
        if (wasParentNode !== hasChildren) {
          // 节点类型发生变化（父节点↔叶子节点），需要完整重建
          needFullRebuild = true
        }
        
        // 特殊处理：如果节点从父节点变为叶子节点，需要设置其 taskChecked 状态
        if (!hasChildren && wasParentNode && prevState) {
          if (!nodeData.data) nodeData.data = {}
          
          // 节点从父节点变为叶子节点，无条件根据之前的完成度更新 taskChecked
          // 100% 完成 → 勾选，未完成 → 不勾选
          nodeData.data.taskChecked = prevState.percentage === 100
        }
        
        const checked = nodeData.data && nodeData.data.taskChecked === true
        
        // 计算完成度
        let completion
        if (hasChildren) {
          completion = this.calculateCompletion(nodeData)
        } else {
          completion = {
            total: 1,
            completed: checked ? 1 : 0,
            percentage: checked ? 100 : 0
          }
        }
        
        // 找到 SVG 元素并更新显示
        const container = node._prefixData.el
        const svg = container ? container.querySelector('svg') : null
        if (svg) {
          if (hasChildren) {
            // 父节点：更新圆形进度
            this.renderProgressCircle(svg, completion.percentage, false)
          } else {
            // 叶子节点：更新勾选框
            this.renderCheckbox(svg, checked, false)
          }
          
          // 更新 tooltip
          const tooltipText = hasChildren 
            ? `完成度: ${completion.percentage}% (${completion.completed}/${completion.total})`
            : `状态: ${completion.percentage === 100 ? '已完成' : '未完成'}`
          container.title = tooltipText
          container.setAttribute('data-tooltip', tooltipText)
        }
        
        // 更新状态缓存（包括节点类型信息）
        this.nodeStateCache.set(node.uid, {
          checked: checked,
          percentage: completion.percentage,
          wasParent: hasChildren
        })
        
        // 递归处理子节点
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => updateCheckboxDisplay(child))
        }
      }
      
      updateCheckboxDisplay(this.mindMap.renderer.root)
      
      if (
        !this.isUsingVirtualView &&
        this.currentVisibleUidSet.size === 0 &&
        this.mindMap.opt &&
        this.mindMap.opt.data
      ) {
        this.currentVisibleUidSet = this.collectVisibleUids(
          this.mindMap.opt.data
        )
      }

      this.runPendingEnterAnimations()

      // 如果需要完整重建，延迟触发一次渲染
      if (needFullRebuild) {
        setTimeout(() => {
          if (!this.isUpdatingFromEvent) {
            this.reRenderTree(true)
          }
        }, 10)
      }
    } finally {
      this.isUpdatingFromEvent = false
    }
  }

  /**
   * 数据变化兜底回调（例如历史前进/后退或粘贴等场景）：
   * 这里延迟到下一帧执行，确保在随后一次渲染后有机会刷新前置内容。
   */
  onDataChange() {
    // 数据变化后，通常会触发渲染，渲染完成后会触发 onNodeTreeRenderEnd
    // 所以这里不需要做额外处理，避免重复更新
  }

  /**
   * 设置节点的勾选状态
   * @param {Object} node - 节点实例
   * @param {Boolean} checked - 是否勾选
   */
  setNodeChecked(node, checked) {
    this.mindMap.execCommand('SET_NODE_DATA', node, {
      taskChecked: checked === true
    })
    this.reRenderTree()
  }

  /**
   * 获取节点的勾选状态
   * @param {Object} node - 节点实例
   * @returns {Boolean} 是否勾选
   */
  getNodeChecked(node) {
    return node.nodeData.data && node.nodeData.data.taskChecked === true
  }

  /**
   * 获取节点的完成度信息
   * @param {Object} node - 节点实例
   * @returns {Object} 完成度信息 { total, completed, percentage }
   */
  getNodeCompletion(node) {
    const completion = this.calculateCompletion(node.nodeData)
    return completion
  }

  /**
   * 切换过滤模式（循环切换）
   * 模式：all（所有）→ uncompleted（未完成）→ completed（已完成）→ all
   */
  cycleFilterMode() {
    if (!this.viewEnabled) {
      console.warn('[TaskCheckbox] 任务视图功能已禁用')
      return
    }
    if (!Array.isArray(this.viewModes) || this.viewModes.length === 0) {
      return
    }
    this.viewModeIndex =
      (this.viewModes.indexOf(this.filterMode) + 1) % this.viewModes.length
    const nextMode = this.viewModes[this.viewModeIndex]
    this.setFilterMode(nextMode)
  }

  /**
   * 设置过滤模式
   * @param {String} mode - 过滤模式：'all'（所有）、'uncompleted'（未完成）、'completed'（已完成）
   */
  setFilterMode(mode, options = {}) {
    if (!this.viewEnabled) {
      console.warn('[TaskCheckbox] 任务视图功能已禁用')
      return
    }
    if (!this.viewModes.includes(mode)) {
      console.warn('Invalid filter mode:', mode)
      return
    }

    if (this.filterMode === mode && !options.force) {
      return
    }

    const previousMode = this.filterMode
    this.filterMode = mode
    this.viewModeIndex = this.viewModes.indexOf(mode)

    if (mode === 'all') {
      this.restoreInteractionLock()
      this.restoreOriginalView()
    } else {
      this.initFullDataCache()
      if (!this.fullDataCache) {
        console.warn('[TaskCheckbox] Failed to snapshot data for view mode')
        return
      }
      if (mode === 'completed') {
        this.lockInteractionsForCompleted()
      } else {
        this.restoreInteractionLock()
      }
      this.applyVirtualView()
    }

    this.mindMap.emit('taskCheckboxFilterChanged', { mode })
    this.showFilterNotification(mode)
  }

  initFullDataCache() {
    if (this.fullDataCache) {
      return
    }
    const snapshot = this.mindMap.command.getCopyData()
    if (!snapshot) {
      return
    }
    this.fullDataCache = simpleDeepClone(snapshot)
    this.refreshUidMap()
    this.recalculateAllCompletion(this.fullDataCache)
  }

  refreshUidMap() {
    this.uidToOriginalData.clear()
    if (!this.fullDataCache) return
    walk(
      this.fullDataCache,
      null,
      node => {
        if (node && node.data && node.data.uid) {
          this.uidToOriginalData.set(node.data.uid, node)
        }
      }
    )
  }

  lockInteractionsForCompleted() {
    if (this.isLockingInteraction) return
    this.isLockingInteraction = true
    this.cachedBeforeTextEdit = this.mindMap.opt.beforeTextEdit
    this.cachedReadonly = this.mindMap.opt.readonly

    this.mindMap.opt.beforeTextEdit = () => false
    this.mindMap.opt.readonly = true
  }

  restoreInteractionLock() {
    if (!this.isLockingInteraction) return
    this.isLockingInteraction = false
    this.mindMap.opt.beforeTextEdit = this.cachedBeforeTextEdit
    this.mindMap.opt.readonly = this.cachedReadonly
    this.cachedBeforeTextEdit = null
    this.cachedReadonly = null
  }

  applyVirtualView() {
    this.isUsingVirtualView = true
    if (!this.mindMap.command.isPause) {
      this.mindMap.command.pause()
    }
    let previousVisible = new Set(this.currentVisibleUidSet)
    if (previousVisible.size === 0) {
      const currentData = this.mindMap.opt && this.mindMap.opt.data
      if (currentData) {
        previousVisible = this.collectVisibleUids(currentData)
      }
    }
    const viewData = this.buildViewData(this.filterMode)
    if (!viewData) return
    const nextVisiblePreview = this.collectVisibleUids(viewData)
    const removed = [...previousVisible].filter(
      uid => !nextVisiblePreview.has(uid)
    )
    const added = [...nextVisiblePreview].filter(
      uid => !previousVisible.has(uid)
    )

    const applyView = () => {
      if (added.length > 0) {
        this.pendingEnterUids = new Set(added)
      } else {
        this.pendingEnterUids.clear()
      }
      this.applyViewData(viewData, nextVisiblePreview)
    }

    const needExitAnimation = removed.length > 0 &&
      (this.filterMode === 'uncompleted' || this.filterMode === 'completed')

    if (needExitAnimation) {
      this.animateNodesExit(removed)
        .then(applyView)
        .catch(() => {
          applyView()
        })
    } else {
      applyView()
    }
  }

  applyViewData(viewData, precomputedVisibleSet = null) {
    const nextVisible = precomputedVisibleSet
      ? new Set(precomputedVisibleSet)
      : this.collectVisibleUids(viewData)
    this.currentVisibleUidSet = nextVisible

    this.setRendererData(viewData)
  }

  setRendererData(data) {
    if (!data) return
    const cloned = simpleDeepClone(data)
    if (this.fullDataCache && this.fullDataCache.smmVersion) {
      cloned.smmVersion = this.fullDataCache.smmVersion
    }
    this.currentViewData = simpleDeepClone(cloned)
    this.mindMap.opt.data = simpleDeepClone(cloned)
    this.mindMap.renderer.setData(cloned)
    this.renderedNodeMap.clear()
    this.mindMap.render()
  }

  collectVisibleUids(node, set = new Set()) {
    if (!node || !node.data) return set
    if (!this.virtualRootUid || node.data.uid !== this.virtualRootUid) {
      set.add(node.data.uid)
    }
    if (node.children && node.children.length) {
      node.children.forEach(child => {
        this.collectVisibleUids(child, set)
      })
    }
    return set
  }

  restoreOriginalView() {
    if (!this.isUsingVirtualView) {
      this.mindMap.render()
      return
    }
    if (this.fullDataCache) {
      const data = simpleDeepClone(this.fullDataCache)
      this.setRendererData(data)
      this.fullDataCache = null
    } else if (this.currentViewData) {
      this.setRendererData(this.currentViewData)
    }
    this.mindMap.command.recovery()
    this.mindMap.command.clearHistory()
    this.mindMap.command.addHistory()
    this.isUsingVirtualView = false
    this.uidToOriginalData.clear()
    this.currentVisibleUidSet.clear()
    this.pendingEnterUids.clear()
    this.virtualRootUid = null
  }

  buildViewData(mode) {
    if (!this.fullDataCache) return null
    if (mode === 'all') {
      return simpleDeepClone(this.fullDataCache)
    }
    if (mode === 'uncompleted') {
      return this.buildUncompletedView()
    }
    if (mode === 'completed') {
      return this.buildCompletedView()
    }
    return simpleDeepClone(this.fullDataCache)
  }

  buildUncompletedView() {
    const filteredRoot = this.collectUncompletedNodes(this.fullDataCache)
    if (!filteredRoot) {
      this.virtualRootUid = createUid()
      return {
        data: {
          uid: this.virtualRootUid,
          text: '未完成任务',
          taskChecked: false
        },
        children: []
      }
    }
    this.virtualRootUid = null
    return filteredRoot
  }

  collectUncompletedNodes(nodeData) {
    if (!nodeData || !nodeData.data) return null
    const clone = this.cloneNodeForView(nodeData)
    const children = nodeData.children || []
    let hasVisibleChild = false
    clone.children = []

    if (children.length > 0) {
      children.forEach(child => {
        const childClone = this.collectUncompletedNodes(child)
        if (childClone) {
          hasVisibleChild = true
          clone.children.push(childClone)
        }
      })
    }

    const isLeaf = children.length === 0
    const checked = nodeData.data && nodeData.data.taskChecked === true
    const completion = nodeData.data && nodeData.data._completion
    const percentage = completion ? completion.percentage : checked ? 100 : 0

    if (isLeaf) {
      return checked ? null : clone
    }

    if (hasVisibleChild) {
      return clone
    }

    return percentage < 100 ? clone : null
  }

  buildCompletedView() {
    const completedRoots = this.collectCompletedNodes(this.fullDataCache)
    this.virtualRootUid = createUid()
    return {
      data: {
        uid: this.virtualRootUid,
        text: '已完成任务',
        taskChecked: true
      },
      children: completedRoots
    }
  }

  collectCompletedNodes(nodeData) {
    if (!nodeData || !nodeData.data) return []
    const children = nodeData.children || []
    const hasChildren = children.length > 0
    
    // 计算当前节点完成度
    const completion = nodeData.data._completion
    const percentage = completion ? completion.percentage : 0
    const checked = nodeData.data && nodeData.data.taskChecked === true
    const isFullyCompleted = hasChildren ? percentage === 100 : checked
    
    // 如果当前节点完成度100%
    if (isFullyCompleted) {
      const clone = simpleDeepClone(nodeData)
      // 递归过滤子节点，只保留已完成的
      if (hasChildren) {
        clone.children = []
        children.forEach(child => {
          const processedChild = this.cloneCompletedSubtree(child)
          if (processedChild) {
            clone.children.push(processedChild)
          }
        })
      }
      return [clone]
    }
    
    // 如果当前节点未完成，递归查找子节点中完成的
    let result = []
    if (hasChildren) {
      children.forEach(child => {
        const childCompleted = this.collectCompletedNodes(child)
        result = result.concat(childCompleted)
      })
    }
    
    return result
  }
  
  cloneCompletedSubtree(nodeData) {
    if (!nodeData) return null
    
    const children = nodeData.children || []
    const hasChildren = children.length > 0
    const completion = nodeData.data && nodeData.data._completion
    const percentage = completion ? completion.percentage : 0
    const checked = nodeData.data && nodeData.data.taskChecked === true
    const isCompleted = hasChildren ? percentage === 100 : checked
    
    // 只保留已完成的节点
    if (!isCompleted) return null
    
    const clone = simpleDeepClone(nodeData)
    
    if (hasChildren) {
      clone.children = []
      children.forEach(child => {
        const processedChild = this.cloneCompletedSubtree(child)
        if (processedChild) {
          clone.children.push(processedChild)
        }
      })
    }
    
    return clone
  }

  cloneNodeForView(nodeData) {
    const clone = simpleDeepClone(nodeData)
    if (clone) {
      clone.children = []
    }
    return clone
  }

  setAllDataChildrenState(nodeData, state) {
    if (!nodeData) return
    nodeData.data = nodeData.data || {}
    const children = nodeData.children || []
    if (!children.length) {
      nodeData.data.taskChecked = state
      return
    }
    children.forEach(child => {
      this.setAllDataChildrenState(child, state)
    })
    nodeData.data.taskChecked = state
  }

  animateNodesExit(uids) {
    if (!uids || uids.length === 0) return Promise.resolve()

    console.log('[TaskCheckbox] 开始淡出动画，节点数:', uids.length)

    return new Promise(resolveMain => {
      const animations = []

      uids.forEach(uid => {
        const node = this.renderedNodeMap.get(uid)
        if (!node || !node.group) {
          console.warn('[TaskCheckbox] 未找到节点group:', uid)
          return
        }

        console.log('[TaskCheckbox] 执行淡出:', uid, node.group)

        try {
          if (typeof node.group.animate === 'function') {
            // 停止之前的动画
            node.group.stop(true, true)
            
            // 启动淡出+右移动画（使用配置的参数）
            const animation = node.group
              .animate(this.animationDuration)
              .ease(this.exitAnimationEasing)
              .opacity(0)
              .dmove(this.animationMoveDistance, 0)
            
            animations.push(
              new Promise(resolve => {
                animation.after(() => {
                  console.log('[TaskCheckbox] 淡出完成:', uid)
                  resolve()
                })
              })
            )
          } else {
            console.warn('[TaskCheckbox] node.group.animate 不是函数')
            node.group.opacity(0)
          }
        } catch (error) {
          console.error('[TaskCheckbox] 动画执行错误:', error)
          if (node.group) {
            node.group.opacity(0)
          }
        }
      })

      if (animations.length === 0) {
        console.warn('[TaskCheckbox] 没有动画可执行')
        resolveMain()
      } else {
        console.log('[TaskCheckbox] 等待', animations.length, '个动画完成')
        Promise.all(animations).then(() => {
          console.log('[TaskCheckbox] 所有淡出动画完成')
          resolveMain()
        })
      }
    })
  }

  runPendingEnterAnimations() {
    if (!this.pendingEnterUids || this.pendingEnterUids.size === 0) return

    // 延迟确保节点已经渲染
    setTimeout(() => {
      this.pendingEnterUids.forEach(uid => {
        const node = this.renderedNodeMap.get(uid)
        if (!node || !node.group) {
          return
        }

        try {
          if (typeof node.group.animate === 'function') {
            node.group.stop(true, true)
            node.group.opacity(0)
            node.group.dmove(-this.animationMoveDistance, 0)
            node.group
              .animate(this.animationDuration)
              .ease(this.enterAnimationEasing)
              .opacity(1)
              .dmove(this.animationMoveDistance, 0)
          } else {
            node.group.opacity(1)
          }
        } catch (error) {
          if (node.group) {
            node.group.opacity(1)
          }
        }
      })
      this.pendingEnterUids.clear()
    }, 50)
  }

  /**
   * 显示过滤通知
   * @param {String} mode - 过滤模式
   */
  showFilterNotification(mode) {
    const messages = {
      'all': '显示所有任务',
      'uncompleted': '仅显示未完成任务',
      'completed': '仅显示已完成任务'
    }
    
    const message = messages[mode] || '过滤模式已更改'
    
    // 创建提示元素
    let notification = document.getElementById('task-checkbox-notification')
    if (!notification) {
      notification = document.createElement('div')
      notification.id = 'task-checkbox-notification'
      notification.style.position = 'fixed'
      notification.style.top = '20px'
      notification.style.left = '50%'
      notification.style.transform = 'translateX(-50%)'
      notification.style.padding = '10px 20px'
      notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
      notification.style.color = 'white'
      notification.style.borderRadius = '4px'
      notification.style.zIndex = '10000'
      notification.style.fontSize = '14px'
      notification.style.transition = 'opacity 0.3s ease'
      document.body.appendChild(notification)
    }
    
    notification.textContent = message
    notification.style.opacity = '1'
    
    // 3秒后自动隐藏
    setTimeout(() => {
      notification.style.opacity = '0'
    }, 2000)
  }

  /**
   * 应用过滤
   */
  // 原 applyFilter 逻辑已替换为按数据构建的视图模式

  /**
   * 显示右键过滤菜单
   * @param {Event} e - 鼠标事件
   */
  showFilterMenu(e) {
    // 移除已存在的菜单
    const existingMenu = document.getElementById('task-checkbox-filter-menu')
    if (existingMenu) {
      existingMenu.remove()
    }
    
    // 创建菜单
    const menu = document.createElement('div')
    menu.id = 'task-checkbox-filter-menu'
    menu.style.position = 'fixed'
    menu.style.left = e.clientX + 'px'
    menu.style.top = e.clientY + 'px'
    menu.style.backgroundColor = 'white'
    menu.style.border = '1px solid #cbd5e1'
    menu.style.borderRadius = '4px'
    menu.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)'
    menu.style.zIndex = '10000'
    menu.style.minWidth = '150px'
    menu.style.overflow = 'hidden'
    
    const modeLabels = {
      all: '显示所有任务',
      uncompleted: '仅显示未完成',
      completed: '仅显示已完成'
    }

    const options = this.viewModes.map(mode => ({
      mode,
      label: modeLabels[mode] || mode
    }))
    
    options.forEach(option => {
      const item = document.createElement('div')
      item.textContent = option.label
      item.style.padding = '8px 16px'
      item.style.cursor = 'pointer'
      item.style.fontSize = '14px'
      item.style.backgroundColor = this.filterMode === option.mode ? '#f0f9ff' : 'white'
      item.style.color = this.filterMode === option.mode ? '#3b82f6' : '#333'
      
      item.addEventListener('mouseenter', () => {
        if (this.filterMode !== option.mode) {
          item.style.backgroundColor = '#f8fafc'
        }
      })
      
      item.addEventListener('mouseleave', () => {
        if (this.filterMode !== option.mode) {
          item.style.backgroundColor = 'white'
        }
      })
      
      item.addEventListener('click', () => {
        this.setFilterMode(option.mode)
        menu.remove()
      })
      
      menu.appendChild(item)
    })
    
    document.body.appendChild(menu)
    
    // 点击其他地方关闭菜单
    const closeMenu = (event) => {
      if (!menu.contains(event.target)) {
        menu.remove()
        document.removeEventListener('click', closeMenu)
      }
    }
    
    setTimeout(() => {
      document.addEventListener('click', closeMenu)
    }, 0)
  }
}

TaskCheckbox.instanceName = 'taskCheckbox'

export default TaskCheckbox
