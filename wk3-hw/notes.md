# 第一节：根据浏览器属性进行排版

在css的基础上通过排版的基础上得到一个带位置的dom树

排版使用flex排版为例，目前css有3代排版技术
- 第一代:正常流，float，position
- 第二代: flex，接近人的自然思维，填满剩余空间（好实现，能力也强）    
   - 基本概念
        - flex-Direction
        - flex-Wrap
        - justify-Content
        - align-content:
        - align-item: 
   - flex排版过程
       1. 收集元素放入主轴
       2. 计算主轴，分配主轴剩余空间
       3. 计算交叉轴
- 第三代: grid， 更强大
- 第四代: css houdini，有点第四代的味道

---
## 主轴与交叉轴
---

**主轴（main axis）**：排版时只要的延伸方向（上下还是左右）
- flex-direction：row
- main：width x left right
- Cross： height y top bottom

**交叉轴（cross axis）**：跟主轴垂直的方向（左右还是上下）
- flex-direction：column
- main：height y top bottom
- Cross： width x left right

---
## 代码部分
---

完成了准备工作：
- 处理了flex direction和wrap相关的属性，
- 把具体的width，height，bottom，top等属性抽象成了main cross相关属性


# 第二节：收集元素进行（row）

分行：
- 根据主轴尺寸，把元素分进行（位置不够，就换行）
- 若设置了no-wrap，则强行的分配进第一行


# 第三节：计算主轴

根据flex相关属性计算每一行里面的尺寸，如果主轴是row，我们这步要计算width，left，right

计算主轴方向
- 找出所有flex元素
- 把主轴方向的剩余尺寸按比例分配给这些元素
- 若剩余空间为负数，所有flex元素为0，等比压缩剩余元素

# 第四节：计算交叉轴

如果主轴是row，我们这步要在交叉轴上计算height，top，bottom

计算交叉轴方向
- 根据每一行中最大元素尺寸计算行高
- 根据行高flex-align和item-align，确定元素具体位置

# 第五节：绘制单个元素

真正的浏览器还会有持续的绘制和监听

绘制的实现需要准备图形环境，使用了npm包images
绘制在一个viewport上进行
与绘制相关的属性有：background-color，border，background-image等

# 第六节：绘制DOM

递归