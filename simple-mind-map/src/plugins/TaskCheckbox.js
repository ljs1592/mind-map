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
    this.updateAllCheckboxes = this.updateAllCheckboxes.bind(this)
    this.handleNodeTreeRenderEnd = this.handleNodeTreeRenderEnd.bind(this)
    this.handleDataChange = this.handleDataChange.bind(this)
    
    // 监听节点创建内容事件
    this.mindMap.on('node_tree_render_end', this.handleNodeTreeRenderEnd)
    
    // 监听数据变化
    this.mindMap.on('data_change', this.handleDataChange)
  }

  /**
   * 处理节点树渲染完成事件
   */
  handleNodeTreeRenderEnd() {
    this.updateAllCheckboxes()
  }

  /**
   * 处理数据变化事件
   */
  handleDataChange() {
    this.updateAllCheckboxes()
  }

  /**
   * 插件被移除前调用的钩子
   */
  beforePluginRemove() {
    this.mindMap.off('node_tree_render_end', this.handleNodeTreeRenderEnd)
    this.mindMap.off('data_change', this.handleDataChange)
  }

  /**
   * 插件被卸载前调用的钩子
   */
  beforePluginDestroy() {
    this.beforePluginRemove()
  }

  /**
   * 更新所有节点的勾选框
   */
  updateAllCheckboxes() {
    const walk = root => {
      if (root.nodeData && root.nodeData.data) {
        this.calculateCompletion(root.nodeData.data)
      }
      if (root.children && root.children.length > 0) {
        root.children.forEach(child => {
          walk(child)
        })
      }
    }
    
    if (this.mindMap.renderer && this.mindMap.renderer.root) {
      walk(this.mindMap.renderer.root)
    }
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
   * 创建勾选框内容
   * @param {Object} node - 节点实例
   * @returns {Object} 勾选框元素信息
   */
  createCheckboxContent(node) {
    const nodeData = node.nodeData.data
    const hasChildren = node.nodeData.children && node.nodeData.children.length > 0
    const checked = nodeData.taskChecked === true
    const completion = nodeData._completion || { total: 0, completed: 0, percentage: 0 }

    // 创建一个 div 容器
    const container = document.createElement('div')
    container.style.width = this.checkboxSize + 'px'
    container.style.height = this.checkboxSize + 'px'
    container.style.display = 'inline-block'
    container.style.cursor = 'pointer'
    
    // 创建 SVG 元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', this.checkboxSize)
    svg.setAttribute('height', this.checkboxSize)
    svg.setAttribute('viewBox', `0 0 ${this.checkboxSize} ${this.checkboxSize}`)
    
    if (hasChildren && completion.total > 0) {
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
      el: container,  // DOM 元素
      width: this.checkboxSize,
      height: this.checkboxSize
    }
  }

  /**
   * 渲染勾选框（叶子节点）- 使用原生 DOM API
   * @param {SVGElement} svg - SVG 容器元素
   * @param {Boolean} checked - 是否勾选
   */
  renderCheckbox(svg, checked) {
    const size = this.checkboxSize

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
   * 渲染进度圆圈（父节点）- 使用原生 DOM API
   * @param {SVGElement} svg - SVG 容器元素
   * @param {Number} percentage - 完成百分比
   */
  renderProgressCircle(svg, percentage) {
    const size = this.checkboxSize
    const radius = size / 2 - 2
    const center = size / 2
    const circumference = 2 * Math.PI * radius

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

    // 百分比文字（小字体）
    if (percentage === 100) {
      // 完成时显示对勾
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
    const nodeData = node.nodeData.data
    const hasChildren = node.nodeData.children && node.nodeData.children.length > 0

    if (!hasChildren) {
      // 叶子节点：切换自身状态
      const newState = !nodeData.taskChecked
      this.mindMap.execCommand('SET_NODE_DATA', node, {
        taskChecked: newState
      })
    } else {
      // 父节点：切换所有子节点状态
      const completion = nodeData._completion || { percentage: 0 }
      const newState = completion.percentage < 100 // 如果未完全完成，则全部勾选；否则全部取消
      this.toggleAllChildren(node, newState)
    }

    // 触发重新渲染
    this.mindMap.render()
  }

  /**
   * 递归切换所有子节点
   * @param {Object} node - 节点实例
   * @param {Boolean} state - 目标状态
   */
  toggleAllChildren(node, state) {
    if (!node.nodeData.children || node.nodeData.children.length === 0) {
      // 叶子节点，设置状态
      this.mindMap.execCommand('SET_NODE_DATA', node, {
        taskChecked: state
      })
      return
    }

    // 递归处理子节点
    node.children.forEach(child => {
      this.toggleAllChildren(child, state)
    })
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
    this.mindMap.render()
  }

  /**
   * 获取节点的勾选状态
   * @param {Object} node - 节点实例
   * @returns {Boolean} 是否勾选
   */
  getNodeChecked(node) {
    return node.nodeData.data.taskChecked === true
  }

  /**
   * 获取节点的完成度信息
   * @param {Object} node - 节点实例
   * @returns {Object} 完成度信息 { total, completed, percentage }
   */
  getNodeCompletion(node) {
    this.calculateCompletion(node.nodeData)
    return node.nodeData.data._completion || { total: 0, completed: 0, percentage: 0 }
  }
}

TaskCheckbox.instanceName = 'taskCheckbox'

export default TaskCheckbox

