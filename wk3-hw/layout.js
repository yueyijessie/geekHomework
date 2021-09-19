
function getStyle(element) {
    if (!element.style) {
      element.style = {}
    }
  
    for (let prop in element.computedStyle) {
      let p = element.computedStyle.value
      element.style[prop] = element.computedStyle[prop].value
        
      // 用px表示的属性，变为纯数字
      if (element.style[prop].toString.match(/px$/)) {
        element.style[prop] = parseInt(element.style[prop])
      }
      // 纯数字字符串的转换一下数据类型
      if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
        element.style[prop] = parseInt(element.style[prop])
      }
  
    }
    return element.style
  }

function layout(element) {
    // 没有computedStyle属性的元素就跳过
    if (!element.computedStyle) {
        return
    }
    // 对style进行一些预处理
    let elementStyle = getStyle(element)

    // toy browser只能处理flex的逻辑，不是flex的就跳过
    if (elementStyle.display !== 'flex') {
        return
    }

    // 过滤掉elements里的文本节点
    let items = element.children.filter(e => e.type === 'element')

    // 排序，为了支持order属性
    items.sort(function(a,b){
        return (a.order || 0) - (b.order || 0)
    })

    let style = elementStyle

    ['width','height'].forEach(size => {
        if (style[size] === 'auto' || style[size] === ''){
            style[size] = null
        }
    })

    // 设置默认值，确保用到的属性都有一个值
    if (!style.flexDirection || style.flexDirection === 'auto') {
        style.flexDirection = 'row';
    }
    if (!style.alignItems || style.alignItems === 'auto') {
        style.alignItems = 'stretch';
    }
    if (!style.justifyContent || style.justifyContent === 'auto') {
        style.justifyContent = 'flex-start';
    }
    if (!style.flexWrap || style.flexWrap === 'auto') {
        style.flexWrap = 'nowrap';
    }
    if (!style.alignContent || style.alignContent === 'auto') {
        style.alignContent = 'stretch';
    }
    
    let mainSize, mainStart, mainEnd, mainSign, mainBase,
    crossSize, crossStart, crossEnd, crossSign, crossBase;
    
    // 处理flexDirection === 'row'的情况
    if (style.flexDirection === 'row') {
        // 主轴从左往右
        mainSize = 'width'
        mainStart = 'left'
        mainEnd = 'right'
        mainSign = +1 // 从左开始去加，从右往左就是相减
        mainBase = 0 // 从左开始就是0，从右开始就是width的长度。和mainsign是一对，可以计算位置。

        // 交叉轴属性，设为和主轴相对的属性
        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    } else if (style.flexDirection === 'row-reverse') {
        // 主轴从右往左
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width; // 从右边开始

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    } else if (style.flexDirection === 'column') {
        // 主轴从上到下
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    } else if (style.flexDirection === 'column-reverse') {
        // 主轴从下到上
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }

    // 反向换行
    if(style.flexWrap === 'wrap-reverse'){
        // 交换交叉轴的开始和结束，交叉轴只受wrap-reverse的影响
        let tmp = crossStart
        crossStart = crossEnd
        crossEnd = tmp
        crossSign = -1
    }else {
        crossBase = 0
        crossSign = 1;
    }

    // 判断父元素的主轴尺寸是否设置
    let isAutoMainSize = false
    if (!style[mainSize]) { // auto sizing
        elementStyle[mainSize] = 0
        // 把所有子元素的size加起来就是主轴的size了
        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            let itemStyle = getStyle(item)
            if(itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0)){
                elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize]
            }
        }
        isAutoMainSize = true
    }

    let flexLine = [] // 行的名字
    let flexLines = [flexLine]
    let mainSpace = elementStyle[mainSize] // 剩余空间等于父元素的mainSize
    let crossSpace = 0

    // 循环所有的flex item
    for(let i =0;i<items.length;i++){
        let item = items[i]
        let itemStyle = getStyle(item)
        // 把属性取出来
        if(itemStyle[mainSize] === null ){
            itemStyle[mainSize] = 0 // 没设置尺寸，默认值为0
        }

        // 判断是否有flex属性
        if(itemStyle.flex){
            flexLine.push(item) // 有flex说明元素是可伸缩的，一定可以放在flexline里
        }else if(style.flexWrap === 'nowrap' && isAutoMainSize){
            // 设置nowrap，强行放进第一行
            mainSpace -= itemStyle[mainSize] // 放进行内，减去这个item的尺寸
            // 计算交叉轴尺寸（行高）
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)){
                crossSpace = Math.max(crossSpace,itemStyle[crossSize]) // 取最高的元素的高度
            }
            flexLine.push(item)
        }else{
            // 元素尺寸 大于 主轴尺寸， 压缩成与主轴一样大
            if(itemStyle[mainSize] > style[mainSize]){
                itemStyle[mainSize] = style[mainSize]
            }
            // 剩下空间不够容纳元素，进行换行
            if(mainSpace < itemStyle[mainSize]){
                flexLine.mainSpace = mainSpace // 主轴空间
                flexLine.crossSpace = crossSpace // 交叉轴空间
                flexLine = [item] // 创建新行
                flexLines.push(flexLine) // 加入新行
                // 重置主轴和交叉轴空间
                mainSpace = style[mainSize]
                crossSpace = 0
            }else {
                flexLine.push(item)
            }

            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)){
                crossSpace = Math.max(crossSpace,itemStyle[crossSpace])
            }
            mainSpace -= itemStyle[mainSize]
        }
    }
    flexLine.mainSpace = mainSpace

    console.log(items)
    
}


module.exports = layout;