// 现代化主题 - 类似 React Flow 的 Tailwind + Shadcn/FramerMotion 风格
export default {
  // 节点内边距
  paddingX: 20,
  paddingY: 12,
  // 图片显示的最大宽度
  imgMaxWidth: 200,
  // 图片显示的最大高度
  imgMaxHeight: 100,
  // icon的大小
  iconSize: 18,
  // 连线的粗细
  lineWidth: 2,
  // 连线的颜色
  lineColor: '#94a3b8',
  // 连线样式
  lineDasharray: 'none',
  // 连线风格
  lineStyle: 'curve', // 使用曲线风格，更现代
  // 曲线连接时，根节点和其他节点的连接线样式保持统一
  rootLineKeepSameInCurve: true,
  // 曲线连接时，根节点和其他节点的连线起始位置保持统一
  rootLineStartPositionKeepSameInCurve: false,
  // 直线连接(straight)时，连线的圆角大小
  lineRadius: 8,
  // 连线是否显示标记
  showLineMarker: false,
  // 概要连线的粗细
  generalizationLineWidth: 2,
  // 概要连线的颜色
  generalizationLineColor: '#8b5cf6',
  // 概要曲线距节点的距离
  generalizationLineMargin: 5,
  // 概要节点距节点的距离
  generalizationNodeMargin: 25,
  // 关联线默认状态的粗细
  associativeLineWidth: 2,
  // 关联线默认状态的颜色
  associativeLineColor: '#64748b',
  // 关联线激活状态的粗细
  associativeLineActiveWidth: 3,
  // 关联线激活状态的颜色
  associativeLineActiveColor: '#3b82f6',
  // 关联线样式
  associativeLineDasharray: 'none',
  // 关联线文字颜色
  associativeLineTextColor: '#475569',
  // 关联线文字大小
  associativeLineTextFontSize: 13,
  // 关联线文字行高
  associativeLineTextLineHeight: 1.4,
  // 关联线文字字体
  associativeLineTextFontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  // 背景颜色
  backgroundColor: '#f8fafc',
  // 背景图片
  backgroundImage: 'none',
  // 背景重复
  backgroundRepeat: 'no-repeat',
  // 设置背景图像的起始位置
  backgroundPosition: 'center center',
  // 设置背景图片大小
  backgroundSize: 'cover',
  // 节点使用只有底边横线的样式
  nodeUseLineStyle: false,
  
  // 根节点样式 - 现代化的大标题风格
  root: {
    shape: 'rectangle',
    fillColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 1.5,
    borderColor: '#e2e8f0',
    borderWidth: 2,
    borderDasharray: 'none',
    borderRadius: 12,
    textDecoration: 'none',
    gradientStyle: false,
    startColor: '',
    endColor: '',
    startDir: [0, 0],
    endDir: [1, 0],
    lineMarkerDir: 'end',
    hoverRectColor: '',
    hoverRectRadius: 8,
    textAlign: 'left',
    imgPlacement: 'top',
    tagPlacement: 'right'
  },
  
  // 二级节点样式
  second: {
    shape: 'rectangle',
    marginX: 60,
    marginY: 20,
    fillColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 1.5,
    borderColor: '#cbd5e1',
    borderWidth: 1.5,
    borderDasharray: 'none',
    borderRadius: 8,
    textDecoration: 'none',
    gradientStyle: false,
    startColor: '',
    endColor: '',
    startDir: [0, 0],
    endDir: [1, 0],
    lineMarkerDir: 'end',
    hoverRectColor: '',
    hoverRectRadius: 6,
    textAlign: 'left',
    imgPlacement: 'top',
    tagPlacement: 'right'
  },
  
  // 三级及以下节点样式
  node: {
    shape: 'rectangle',
    marginX: 50,
    marginY: 15,
    fillColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#334155',
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'normal',
    lineHeight: 1.5,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderDasharray: 'none',
    borderRadius: 6,
    textDecoration: 'none',
    gradientStyle: false,
    startColor: '',
    endColor: '',
    startDir: [0, 0],
    endDir: [1, 0],
    lineMarkerDir: 'end',
    hoverRectColor: '',
    hoverRectRadius: 5,
    textAlign: 'left',
    imgPlacement: 'top',
    tagPlacement: 'right'
  },
  
  // 概要节点样式
  generalization: {
    shape: 'rectangle',
    marginX: 50,
    marginY: 15,
    fillColor: '#f8f9fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 1.5,
    borderColor: '#c4b5fd',
    borderWidth: 1.5,
    borderDasharray: 'none',
    borderRadius: 6,
    textDecoration: 'none',
    gradientStyle: false,
    startColor: '',
    endColor: '',
    startDir: [0, 0],
    endDir: [1, 0],
    lineMarkerDir: 'end',
    hoverRectColor: '',
    hoverRectRadius: 5,
    textAlign: 'left',
    imgPlacement: 'top',
    tagPlacement: 'right'
  }
}

