// ===================================================================
// 现代化主题配置文件 - 类似 React Flow 的 Tailwind + Shadcn/FramerMotion 风格
// ===================================================================

export default {
  // -------------------------------------------------------------------
  // 【节点内边距配置】控制节点文字与边框之间的距离
  // -------------------------------------------------------------------
  paddingX: 20,    // 水平内边距(左右)，单位px，增大此值可让节点更宽
  paddingY: 12,    // 垂直内边距(上下)，单位px，增大此值可让节点更高
  
  // -------------------------------------------------------------------
  // 【图片和图标配置】
  // -------------------------------------------------------------------
  imgMaxWidth: 200,   // 节点内图片显示的最大宽度，单位px
  imgMaxHeight: 100,  // 节点内图片显示的最大高度，单位px
  iconSize: 18,       // 节点内icon图标的大小，单位px
  
  // -------------------------------------------------------------------
  // 【连线配置】控制节点之间连线的外观
  // 💡 如何改变连线风格：修改 lineStyle 属性
  // -------------------------------------------------------------------
  lineWidth: 2,              // 连线的粗细，单位px
  lineColor: '#94a3b8',      // 连线的颜色(灰蓝色)
  lineDasharray: 'none',     // 连线样式：'none'=实线，'5,5'=虚线，'10,5'=长虚线
  lineStyle: 'curve',        // 🔥 连线风格：'curve'=曲线，'straight'=直线，'direct'=直连
  
  // 曲线连接相关配置
  rootLineKeepSameInCurve: true,              // 曲线模式下，根节点连线是否与其他节点保持一致
  rootLineStartPositionKeepSameInCurve: false, // 曲线模式下，根节点连线起始位置是否统一
  
  // 直线连接相关配置
  lineRadius: 8,             // 直线连接(straight)时，转角处的圆角大小，单位px
  
  showLineMarker: false,     // 连线是否显示箭头标记
  
  // -------------------------------------------------------------------
  // 【概要连线配置】概要(总结)节点的连线样式
  // -------------------------------------------------------------------
  generalizationLineWidth: 2,       // 概要连线的粗细，单位px
  generalizationLineColor: '#8b5cf6', // 概要连线的颜色(紫色)
  generalizationLineMargin: 5,      // 概要曲线距离节点的距离，单位px
  generalizationNodeMargin: 25,     // 概要节点距离被总结节点的距离，单位px
  
  // -------------------------------------------------------------------
  // 【关联线配置】不同分支节点之间的关联线样式
  // -------------------------------------------------------------------
  associativeLineWidth: 2,              // 关联线默认状态的粗细，单位px
  associativeLineColor: '#64748b',      // 关联线默认状态的颜色(深灰)
  associativeLineActiveWidth: 3,        // 关联线激活(选中)状态的粗细，单位px
  associativeLineActiveColor: '#3b82f6', // 关联线激活状态的颜色(蓝色)
  associativeLineDasharray: 'none',     // 关联线样式：'none'=实线，'5,5'=虚线
  
  // 关联线文字样式
  associativeLineTextColor: '#475569',     // 关联线文字颜色
  associativeLineTextFontSize: 13,         // 关联线文字大小，单位px
  associativeLineTextLineHeight: 1.4,      // 关联线文字行高
  associativeLineTextFontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  
  // -------------------------------------------------------------------
  // 【背景配置】画布背景样式
  // -------------------------------------------------------------------
  backgroundColor: '#f8fafc',          // 背景颜色(浅灰白色)
  backgroundImage: 'none',             // 背景图片URL，例：'url(bg.jpg)'
  backgroundRepeat: 'no-repeat',       // 背景重复方式：'repeat', 'no-repeat', 'repeat-x', 'repeat-y'
  backgroundPosition: 'center center', // 背景图片位置
  backgroundSize: 'cover',             // 背景图片大小：'cover', 'contain', '100px 100px'
  
  // -------------------------------------------------------------------
  // 【节点样式模式】
  // -------------------------------------------------------------------
  nodeUseLineStyle: false,   // 是否使用只有底边横线的极简样式(false=使用完整边框)
  
  // -------------------------------------------------------------------
  // 【根节点样式】思维导图的中心主题节点
  // -------------------------------------------------------------------
  root: {
    shape: 'rectangle',        // 节点形状：'rectangle'=矩形，'roundedRectangle'=圆角矩形，'circle'=圆形，'diamond'=菱形
    fillColor: '#ffffff',      // 节点填充颜色(白色)
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', // 字体
    color: '#0f172a',          // 文字颜色(深蓝灰)
    fontSize: 20,              // 文字大小，单位px
    fontWeight: '600',         // 字体粗细：'400'=正常，'500'=中等，'600'=半粗，'700'=粗体
    fontStyle: 'normal',       // 字体样式：'normal'=正常，'italic'=斜体
    lineHeight: 1.5,           // 行高倍数
    borderColor: '#e2e8f0',    // 边框颜色(浅灰)
    borderWidth: 2,            // 边框粗细，单位px
    borderDasharray: 'none',   // 边框样式：'none'=实线，'5,5'=虚线
    borderRadius: 12,          // 边框圆角大小，单位px
    textDecoration: 'none',    // 文字装饰：'none'=无，'underline'=下划线，'line-through'=删除线
    gradientStyle: false,      // 是否使用渐变填充
    startColor: '',            // 渐变起始颜色(gradientStyle=true时生效)
    endColor: '',              // 渐变结束颜色(gradientStyle=true时生效)
    startDir: [0, 0],          // 渐变起始方向
    endDir: [1, 0],            // 渐变结束方向
    lineMarkerDir: 'end',      // 连线箭头方向：'start'=起点，'end'=终点，'both'=双向
    hoverRectColor: '',        // 鼠标悬停时的边框颜色(空=不改变)
    hoverRectRadius: 8,        // 鼠标悬停时的边框圆角
    textAlign: 'left',         // 文字对齐：'left'=左对齐，'center'=居中，'right'=右对齐
    imgPlacement: 'top',       // 图片位置：'top'=上方，'bottom'=下方，'left'=左侧，'right'=右侧
    tagPlacement: 'right'      // 标签位置：'top'=上方，'bottom'=下方，'left'=左侧，'right'=右侧
  },
  
  // -------------------------------------------------------------------
  // 【二级节点样式】根节点的直接子节点
  // 💡 调整节点间距：修改 marginX 和 marginY
  // -------------------------------------------------------------------
  second: {
    shape: 'rectangle',        // 节点形状
    marginX: 45,               // 🔥 水平间距：节点与节点之间的左右间距，单位px
    marginY: 10,               // 🔥 垂直间距：节点与节点之间的上下间距，单位px
    fillColor: '#ffffff',      // 节点填充颜色(白色)
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#1e293b',          // 文字颜色(深灰蓝)
    fontSize: 16,              // 文字大小，单位px
    fontWeight: '500',         // 字体粗细
    fontStyle: 'normal',       // 字体样式
    lineHeight: 1.5,           // 行高倍数
    borderColor: '#cbd5e1',    // 边框颜色(中灰)
    borderWidth: 1.5,          // 边框粗细，单位px
    borderDasharray: 'none',   // 边框样式
    borderRadius: 8,           // 边框圆角大小，单位px
    textDecoration: 'none',    // 文字装饰
    gradientStyle: false,      // 是否使用渐变填充
    startColor: '',            // 渐变起始颜色
    endColor: '',              // 渐变结束颜色
    startDir: [0, 0],          // 渐变起始方向
    endDir: [1, 0],            // 渐变结束方向
    lineMarkerDir: 'end',      // 连线箭头方向
    hoverRectColor: '',        // 鼠标悬停时的边框颜色
    hoverRectRadius: 6,        // 鼠标悬停时的边框圆角
    textAlign: 'left',         // 文字对齐方式
    imgPlacement: 'top',       // 图片位置
    tagPlacement: 'right'      // 标签位置
  },
  
  // -------------------------------------------------------------------
  // 【三级及以下节点样式】更深层级的子节点
  // 💡 调整节点间距：修改 marginX 和 marginY
  // -------------------------------------------------------------------
  node: {
    shape: 'rectangle',        // 节点形状
    marginX: 35,               // 🔥 水平间距，单位px（比二级节点稍小）
    marginY: 7,               // 🔥 垂直间距，单位px（比二级节点稍小）
    fillColor: '#ffffff',      // 节点填充颜色(白色)
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#334155',          // 文字颜色(中等灰)
    fontSize: 14,              // 文字大小，单位px
    fontWeight: '400',         // 字体粗细(正常)
    fontStyle: 'normal',       // 字体样式
    lineHeight: 1.5,           // 行高倍数
    borderColor: '#e2e8f0',    // 边框颜色(浅灰)
    borderWidth: 1,            // 边框粗细，单位px
    borderDasharray: 'none',   // 边框样式
    borderRadius: 6,           // 边框圆角大小，单位px
    textDecoration: 'none',    // 文字装饰
    gradientStyle: false,      // 是否使用渐变填充
    startColor: '',            // 渐变起始颜色
    endColor: '',              // 渐变结束颜色
    startDir: [0, 0],          // 渐变起始方向
    endDir: [1, 0],            // 渐变结束方向
    lineMarkerDir: 'end',      // 连线箭头方向
    hoverRectColor: '',        // 鼠标悬停时的边框颜色
    hoverRectRadius: 5,        // 鼠标悬停时的边框圆角
    textAlign: 'left',         // 文字对齐方式
    imgPlacement: 'top',       // 图片位置
    tagPlacement: 'right'      // 标签位置
  },
  
  // -------------------------------------------------------------------
  // 【概要节点样式】用于总结多个节点的特殊节点
  // -------------------------------------------------------------------
  generalization: {
    shape: 'rectangle',        // 节点形状
    marginX: 50,               // 水平间距，单位px
    marginY: 15,               // 垂直间距，单位px
    fillColor: '#f8f9fa',      // 节点填充颜色(浅灰白)
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#8b5cf6',          // 文字颜色(紫色，用于区分)
    fontSize: 14,              // 文字大小，单位px
    fontWeight: '500',         // 字体粗细(中等粗)
    fontStyle: 'normal',       // 字体样式
    lineHeight: 1.5,           // 行高倍数
    borderColor: '#c4b5fd',    // 边框颜色(浅紫色)
    borderWidth: 1.5,          // 边框粗细，单位px
    borderDasharray: 'none',   // 边框样式
    borderRadius: 6,           // 边框圆角大小，单位px
    textDecoration: 'none',    // 文字装饰
    gradientStyle: false,      // 是否使用渐变填充
    startColor: '',            // 渐变起始颜色
    endColor: '',              // 渐变结束颜色
    startDir: [0, 0],          // 渐变起始方向
    endDir: [1, 0],            // 渐变结束方向
    lineMarkerDir: 'end',      // 连线箭头方向
    hoverRectColor: '',        // 鼠标悬停时的边框颜色
    hoverRectRadius: 5,        // 鼠标悬停时的边框圆角
    textAlign: 'left',         // 文字对齐方式
    imgPlacement: 'top',       // 图片位置
    tagPlacement: 'right'      // 标签位置
  }
}

// ===================================================================
// 📖 使用指南
// ===================================================================
//
// ❓ 问题1：怎么调整节点大小和节点间间距？
//
// 【调整节点大小】
//   方法1：修改 paddingX 和 paddingY（第9-10行）
//          - paddingX: 控制节点左右内边距，增大则节点更宽
//          - paddingY: 控制节点上下内边距，增大则节点更高
//   
//   方法2：修改各级节点的 fontSize（根节点82行，二级115行，三级148行）
//          - 文字越大，节点自动变大
//
// 【调整节点间距】
//   修改各级节点配置中的 marginX 和 marginY：
//   - second.marginX（110行）：二级节点的水平间距，默认60px
//   - second.marginY（111行）：二级节点的垂直间距，默认20px
//   - node.marginX（143行）：三级节点的水平间距，默认50px
//   - node.marginY（144行）：三级节点的垂直间距，默认15px
//
//   💡 提示：
//   - marginX 值越大，节点横向间距越大
//   - marginY 值越大，节点纵向间距越大
//   - 建议二级节点间距 > 三级节点间距，保持层次感
//
// ❓ 问题2：怎么改变连线风格？
//
// 【修改连线风格】
//   在第26行修改 lineStyle 属性：
//   
//   lineStyle: 'curve'     ✅ 当前：曲线风格（贝塞尔曲线，最现代）
//   lineStyle: 'straight'  ⭕ 改为：直线风格（带圆角的折线）
//   lineStyle: 'direct'    ⭕ 改为：直连风格（完全笔直的线）
//
// 【连线其他配置】
//   - lineWidth（23行）：连线粗细
//   - lineColor（24行）：连线颜色
//   - lineDasharray（25行）：虚线样式，'5,5'=短虚线，'10,5'=长虚线
//   - lineRadius（33行）：直线模式下转角的圆角大小
//   - showLineMarker（35行）：是否显示箭头，true=显示，false=隐藏
//
// 【示例：改为直线风格】
//   lineStyle: 'straight',  // 使用直线
//   lineRadius: 12,         // 增大转角圆角
//   showLineMarker: true,   // 显示箭头
//
// ===================================================================

