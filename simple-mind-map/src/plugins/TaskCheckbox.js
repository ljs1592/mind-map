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
    this.filterMode = 'all' // 'all', 'uncompleted', 'completed'
    
    // 用于跟踪节点的上一次状态，避免重复播放动画
    // key: node.uid, value: { checked: boolean, percentage: number }
    this.nodeStateCache = new Map()
    
    // 绑定方法到当前实例，确保 this 上下文正确
    this.createCheckboxContent = this.createCheckboxContent.bind(this)
    this.handleBeforeShowTextEdit = this.handleBeforeShowTextEdit.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleNodeActive = this.handleNodeActive.bind(this)
    this.handleDataChange = this.handleDataChange.bind(this)
    
    // 设置 createNodePrefixContent 配置
    this.mindMap.opt.createNodePrefixContent = this.createCheckboxContent
    
    // 监听文本编辑前事件，防止点击勾选框时触发编辑
    this.mindMap.on('before_show_text_edit', this.handleBeforeShowTextEdit)
    
    // 监听节点激活事件（节点添加/删除后会触发）
    this.mindMap.on('node_active', this.handleNodeActive)
    
    // 监听数据变化事件
    this.mindMap.on('data_change', this.handleDataChange)
    
    // 监听键盘事件，实现 Ctrl+F 快捷键
    document.addEventListener('keydown', this.handleKeyDown)
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
   * 处理节点激活事件
   * 当节点添加、删除或结构变化时触发
   */
  handleNodeActive(node, activeNodeList) {
    // 节点激活可能是添加、删除、选中等操作
    // 使用防抖，避免频繁重渲染
    this.scheduleReRender()
  }

  /**
   * 处理数据变化事件
   * 当节点数据变化时触发
   */
  handleDataChange(data) {
    // 数据变化时重新渲染
    // 使用防抖，避免频繁重渲染
    this.scheduleReRender()
  }

  /**
   * 计划重新渲染（防抖）
   * 避免短时间内多次重渲染
   */
  scheduleReRender() {
    if (this.reRenderTimer) {
      clearTimeout(this.reRenderTimer)
    }
    this.reRenderTimer = setTimeout(() => {
      this.reRenderTree()
      this.reRenderTimer = null
    }, 200)
  }

  /**
   * 插件被移除前调用的钩子
   */
  beforePluginRemove() {
    // 清理定时器
    if (this.reRenderTimer) {
      clearTimeout(this.reRenderTimer)
      this.reRenderTimer = null
    }
    
    // 清理状态缓存
    this.nodeStateCache.clear()
    
    // 移除事件监听
    this.mindMap.off('before_show_text_edit', this.handleBeforeShowTextEdit)
    this.mindMap.off('node_active', this.handleNodeActive)
    this.mindMap.off('data_change', this.handleDataChange)
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
    
    // 更新状态缓存
    this.nodeStateCache.set(nodeUid, {
      checked: checked,
      percentage: completion.percentage
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
  reRenderTree() {
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
    
    // 触发完整渲染
    this.mindMap.render()
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
    const modes = ['all', 'uncompleted', 'completed']
    const currentIndex = modes.indexOf(this.filterMode)
    const nextIndex = (currentIndex + 1) % modes.length
    this.setFilterMode(modes[nextIndex])
  }

  /**
   * 设置过滤模式
   * @param {String} mode - 过滤模式：'all'（所有）、'uncompleted'（未完成）、'completed'（已完成）
   */
  setFilterMode(mode) {
    if (!['all', 'uncompleted', 'completed'].includes(mode)) {
      console.warn('Invalid filter mode:', mode)
      return
    }
    
    this.filterMode = mode
    this.applyFilter()
    
    // 触发事件通知外部
    this.mindMap.emit('taskCheckboxFilterChanged', { mode })
    
    // 显示提示信息
    this.showFilterNotification(mode)
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
  applyFilter() {
    if (!this.mindMap.renderer || !this.mindMap.renderer.root) {
      return
    }
    
    const walk = (node) => {
      if (!node || !node.group) return
      
      const nodeData = node.nodeData
      const hasChildren = nodeData.children && nodeData.children.length > 0
      
      let shouldShow = true
      
      if (this.filterMode === 'uncompleted') {
        // 仅显示未完成的节点
        if (hasChildren) {
          const completion = this.calculateCompletion(nodeData)
          shouldShow = completion.percentage < 100
        } else {
          const checked = nodeData.data && nodeData.data.taskChecked === true
          shouldShow = !checked
        }
      } else if (this.filterMode === 'completed') {
        // 仅显示已完成的节点
        if (hasChildren) {
          const completion = this.calculateCompletion(nodeData)
          shouldShow = completion.percentage === 100
        } else {
          const checked = nodeData.data && nodeData.data.taskChecked === true
          shouldShow = checked
        }
      }
      
      // 设置节点可见性
      if (node.group) {
        node.group.style.opacity = shouldShow ? 1 : 0.3
        // 可选：完全隐藏节点
        // node.group.style.display = shouldShow ? 'block' : 'none'
      }
      
      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => walk(child))
      }
    }
    
    walk(this.mindMap.renderer.root)
    this.mindMap.render()
  }

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
    
    const options = [
      { mode: 'all', label: '显示所有任务' },
      { mode: 'uncompleted', label: '仅显示未完成' },
      { mode: 'completed', label: '仅显示已完成' }
    ]
    
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
