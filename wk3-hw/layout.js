
function getStyle(element) {
    if (!element.style) {
      element.style = {}
    }
  
    for (let prop in element.computedStyle) {
      let p = element.computedStyle.value
      element.style[prop] = element.computedStyle[prop].value
        
      // 用px表示的属性，变为纯数字
      if (element.style[prop].toString().match(/px$/)) {
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

    let style = elementStyle;

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

    // 如果是nowrap，保存crossSpace
    if(style.flexWrap === 'nowrap' || isAutoMainSize){
        flexLine.crossSpace = (style[crossSize] !== undefined)?style[crossSize]:crossSpace
    }else{
        flexLine.crossSpace = crossSpace
    }

    // 如果剩余空间为负数，overflow的情况，根据主轴size等比压缩每个元素
    if(mainSpace < 0){
        // 仅发生单行的逻辑
        let scale = style[mainSize] / (style[mainSize] - mainSpace)
        let currentMain = mainBase
        for(let i=0;i<items.length;i++){
            let item = items[i]
            let itemStyle = getStyle(item)
            // flex无法等比压缩，尺寸为0
            if(itemStyle.flex){
                itemStyle[mainSize] = 0
            }
            // 计算元素大小，width
            itemStyle[mainSize] = itemStyle[mainSize] * scale 
            // 计算元素位置，left和right
            itemStyle[mainStart] = currentMain
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
            currentMain = itemStyle[mainEnd] // 当前位置设置为当前元素结尾的位置
        }
    } else {
        // 多行的逻辑
        flexLines.forEach(item => {
            // 把每一行拿出来处理
            let mainSpace = item.mainSpace
            let flexTotal = 0
            for(let i = 0; i < items.length; i++){
                let item = items[i]
                let itemStyle = getStyle(item)
                if((itemStyle.flex !== null) && (itemStyle.flex !== (void 0))){
                    flexTotal += itemStyle.flex
                    continue
                }
            }

            if(flexTotal > 0 ){
                // 如果有flex元素，处理felx元素
                let currentMain = mainBase
                for(let i=0; i < items.length; i++){
                    let item = items[i]
                    let itemStyle = getStyle(item)
                    if(itemStyle.flex){
                        itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex // 等比划分，计算flex元素的主轴尺寸
                    }
                    itemStyle[mainStart] = currentMain
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                    currentMain = itemStyle[mainEnd]
                }
            }else {
                // 如果没有flex元素，主轴方向的剩余空间根据justifyContent规则进行分配
                if(style.justifyContent === 'flex-start'){
                    // 从左向右
                    let currentMain = mainBase
                    let step = 0
                }
                if( style.justifyContent === 'flex-end'){
                    // 从右向左
                    let currentMain = mainSpace * mainSign + mainBase
                    let step = 0
                }
                if( style.justifyContent === 'center' ){
                    // 左右各留一边，元素之间没间隔
                    let currentMain = mainSpace / 2 * mainSign + mainBase
                    let step = 0
                }
                if(style.justifyContent === 'space-between' ){
                    // 所有元素间有间隔
                    let currentMain = mainSpace / (items.length - 1) * mainSign
                    let step = 0
                }
                if (style.justifyContent === 'space-around') {
                    // 前后也有间隔
                    var step = mainSpace / items.length * mainSign;
                    var currentMain = step / 2 + mainBase;
                }
                for(let i = 0;i<items.length;i++){
                    let item = items[i]
                    let itemStyle = getStyle(item)
                    itemStyle[mainStart] = currentMain
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                    currentMain = itemStyle[mainEnd] + step
                }
            }

        })
    }

    // 计算交叉轴size
    // align-items, align-self

    // var crossSpace; // 剩余行高

    // 判断是否设置有行高
    if (!style[crossSize]) { // auto sizing
        // 没有设置行高，剩余为0
        crossSpace = 0;
        // 计算元素的高度
        elementStyle[crossSize] = 0;
        for (let i = 0;i < flexLines.length;i++) {
            elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace;
        }
    } else {
        // 有行高，依次减掉每一个flex，得到剩余行高
        crossSpace = style[crossSize];
        for (let i = 0;i < flexLines.length;i++) {
            crossSpace -= flexLines[i].crossSpace;
        }
    }

    // 如果需要reverse，从尾到头进行分布，影响的是crossBase
    if (style.flexWrap === 'wrap-reverse') {
        crossBase = style[crossSize];
    } else {
        crossBase = 0;
    }

    // 总体交叉轴尺寸 / 行数
    var lineSize = style[crossSize] / flexLines.length;

    // 矫正crossbase
    var step;
    if (style.alignContent === 'flex-start') {
        crossBase += 0;
        step = 0;
    }
    if (style.alignContent === 'flex-end') {
        crossBase += crossSign * crossSpace;
        step = 0;
    }
    if (style.alignContent === 'center') {
        crossBase += crossSign * crossSpace / 2;
        step = 0;
    }
    if (style.alignContent === 'space-between') {
        crossBase += 0;
        step = crossSpace / (flexLines.length - 1);
    }
    if (style.alignContent === 'space-around') {
        step = crossSpace / (flexLines.length);
        crossBase += crossSign * step / 2;
    }
    if (style.alignContent === 'stretch') {
        crossBase += 0;
        step = 0;
    }
    flexLines.forEach( item => {
        var lineCrossSize = style.alignContent === 'stretch' ? item.crossSpace + crossSpace / flexLines.length : item.crossSpace;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let itemStyle = getStyle(item);

            // 元素的align可以受自己元素的alignSelf影响（优先），也可以受父元素的alignItems影响
            var align = itemStyle.alignSelf || style.alignItems;

            if (itemStyle[crossSize] === null) {
                itemStyle[crossSize] = align === 'stretch' ? lineCrossSize : 0;
            }

            if (align === 'flex-start') {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            }
            if (align === 'flex-end') {
                itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
                itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
            }
            if (align === 'center') {
                itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            }
            if (align === 'stretch') {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) ? itemStyle[crossSize] : lineCrossSize);
                itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
            }
        }
        crossBase += crossSign * (lineCrossSize + step);
    });
    console.log(items);
    
}


module.exports = layout;