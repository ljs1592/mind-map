/**
 * 任务勾选框插件
 * 支持节点的任务勾选功能，父节点会显示子节点的完成度
 */
class TaskCheckbox {
  constructor({ mindMap }) {
    this.mindMap = mindMap
    this.checkboxSize = 18
    this.checkboxMargin = 8
    
    // 绑定方法到当前实例，确保 this 上下文正确
    this.createCheckboxContent = this.createCheckboxContent.bind(this)
    this.handleBeforeShowTextEdit = this.handleBeforeShowTextEdit.bind(this)
    
    // 设置 createNodePrefixContent 配置
    this.mindMap.opt.createNodePrefixContent = this.createCheckboxContent
    
    // 监听文本编辑前事件，防止点击勾选框时触发编辑
    this.mindMap.on('before_show_text_edit', this.handleBeforeShowTextEdit)
  }

  /**
   * 处理文本编辑前事件
   */
  handleBeforeShowTextEdit() {
    // 可以在这里添加逻辑，防止点击勾选框时触发文本编辑
  }

  /**
   * 插件被移除前调用的钩子
   */
  beforePluginRemove() {
    this.mindMap.off('before_show_text_edit', this.handleBeforeShowTextEdit)
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

    // 有子节点，递归计算
    let total = 0
    let completed = 0

    nodeData.children.forEach(child => {
      const childCompletion = this.calculateCompletion(child)
      total += childCompletion.total
      completed += childCompletion.completed
    })

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    // 缓存完成度信息到节点数据
    if (!nodeData.data) nodeData.data = {}
    nodeData.data._completion = { total, completed, percentage }

    return { total, completed, percentage }
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
    }

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
      this.renderProgressCircle(svg, completion.percentage)
    } else {
      // 叶子节点：显示勾选框
      this.renderCheckbox(svg, checked)
    }
    
    container.appendChild(svg)
    
    // 添加点击事件
    container.addEventListener('click', (e) => {
      e.stopPropagation()
      this.toggleCheckbox(node)
    })

    // 返回符合 createNodePrefixContent 要求的对象格式
    return {
      el: container,
      width: this.checkboxSize + this.checkboxMargin,
      height: this.checkboxSize
    }
  }

  /**
   * 渲染勾选框（叶子节点）
   * @param {SVGElement} svg - SVG 容器元素
   * @param {Boolean} checked - 是否勾选
   */
  renderCheckbox(svg, checked) {
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
    rect.style.transition = 'all 0.2s ease'

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
      
      svg.appendChild(checkPath)
    }
  }

  /**
   * 渲染进度圆圈（父节点）
   * @param {SVGElement} svg - SVG 容器元素
   * @param {Number} percentage - 完成百分比
   */
  renderProgressCircle(svg, percentage) {
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

    // 进度圆圈
    if (percentage > 0) {
      const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      progressCircle.setAttribute('cx', center)
      progressCircle.setAttribute('cy', center)
      progressCircle.setAttribute('r', radius)
      progressCircle.setAttribute('fill', 'none')
      progressCircle.setAttribute('stroke', '#3b82f6')
      progressCircle.setAttribute('stroke-width', 2)
      progressCircle.setAttribute('stroke-linecap', 'round')
      progressCircle.setAttribute('stroke-dasharray', circumference)
      progressCircle.setAttribute('stroke-dashoffset', circumference * (1 - percentage / 100))
      progressCircle.setAttribute('transform', `rotate(-90 ${center} ${center})`)
      progressCircle.style.transition = 'stroke-dashoffset 0.3s ease'

      svg.appendChild(progressCircle)
    }

    // 完成时显示对勾
    if (percentage === 100) {
      const checkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      checkPath.setAttribute('d', `M${center - 3},${center} L${center - 1},${center + 2} L${center + 3},${center - 2}`)
      checkPath.setAttribute('fill', 'none')
      checkPath.setAttribute('stroke', '#3b82f6')
      checkPath.setAttribute('stroke-width', 2)
      checkPath.setAttribute('stroke-linecap', 'round')
      checkPath.setAttribute('stroke-linejoin', 'round')
      
      svg.appendChild(checkPath)
    }
  }

  /**
   * 切换勾选框状态
   * @param {Object} node - 节点实例
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
      this.setAllChildrenState(node, newState)
    }

    // 重新渲染整棵树以更新所有勾选框
    this.reRenderTree()
  }

  /**
   * 递归设置所有后代叶子节点的勾选状态
   * @param {Object} node - 节点实例
   * @param {Boolean} state - 目标状态
   */
  setAllChildrenState(node, state) {
    const walk = (currentNode) => {
      const hasChildren = currentNode.nodeData.children && currentNode.nodeData.children.length > 0
      
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
    
    walk(node)
  }

  /**
   * 重新渲染整棵节点树
   */
  reRenderTree() {
    // 使用延迟确保数据已更新
    setTimeout(() => {
      const walk = (node) => {
        // 重新创建前置内容（勾选框）
        if (node && node.createNodeContents) {
          node.createNodeContents(['prefix'])
        }
        // 递归处理子节点
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => walk(child))
        }
      }
      
      if (this.mindMap.renderer && this.mindMap.renderer.root) {
        walk(this.mindMap.renderer.root)
      }
      
      // 触发完整渲染
      this.mindMap.render()
    }, 50)
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
}

TaskCheckbox.instanceName = 'taskCheckbox'

export default TaskCheckbox
