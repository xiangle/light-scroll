/**
 * 事件基类
 */
class Base {
   /**
    * Touch容器DOM对象
    * @param {Dom} el 
    */
   constructor(el) {
      this.el = el
      this.container = el.children[0] // Touch容器Dom对象
      this.startX = 0 // 起始X坐标
      this.startY = 0 // 起始Y坐标
      this.pageX = 0 // 滑动X坐标
      this.pageY = 0 // 滑动Y坐标
      this.moveX = 0 // 横向滑动距离，滑动X坐标与起始X坐标之间的差值
      this.moveY = 0 // 纵向滑动距离，滑动Y坐标与起始Y坐标之间的差值
      this.lastX = [0, 0, 0] // 前三个moveX坐标
      this.lastY = [0, 0, 0] // 前三个moveY坐标
      this.touchstart = [] // touchstart事件队列
      this.touchmove = [] // touchmove事件队列
      this.touchend = [] // touchend事件队列
      this.slideGap = 5 // 初始自由滑动间隙阈值，单位px
      this.direction = 'level' // touch手势类型，level（水平滑动）、'vertical'（垂直滑动）
      this.dir = 'X' // 简写的direction值，用于动态切换变量名
      this.distance = 5 // 位移差阈值，用于判断touchend时触点释放的速度，单位px
      this.shift = 0 // 触点释放时的位移量，可用于判断位移方向和速度，单位px
      this.lock = true // touch状态锁，当为true时会限制所有touchmove、touchend行为，只能通过touchstart解锁
      this.translateStartX = 0 // container横向位移起点
      this.translateStartY = 0 // container纵向位移起点
      this.translateX = 0 // container横向位移
      this.translateY = 0 // container纵向位移
      this.translateEndX = 0 // container横向位移终点
      this.translateEndY = 0 // container纵向位移终点
      this.damping = 6 // 滑动阻尼系数，用于末端缓速
   }
   /**
    * 属性混合
    */
   mixing(...options) {
      Object.assign(this, ...options);
      if (this.direction === 'level') {
         this.dir = 'X'
      } else {
         this.dir = 'Y'
      }
   }
   /**
    * 事件订阅
    * @param {*} name 订阅事件名称
    * @param {*} func 订阅事件回调函数
    */
   on(name, func) {
      if (!this[name]) this[name] = []
      if (func instanceof Function) {
         this[name].push(func.bind(this))
      } else {
         console.error(`['touch-box'] ${name}事件添加失败，回调必须为函数类型`)
      }
      return this;
   }
   /**
    * 事件发送
    * @param {*} name 发送事件名称
    * @param {*} ev 发送事件内容
    */
   emit(name, ev) {
      if (this[name]) {
         for (let item of this[name]) {
            item(ev);
         }
      }
   }
   /**
    * 设置触点起始坐标
    * @param {Event} ev 
    * @param {Number} pageX
    * @param {Number} pageY
    */
   StartAgent(ev, pageX, pageY) {

      this.startX = pageX
      this.startY = pageY
      this.pageX = pageX
      this.pageY = pageY
      this.shift = 0
      this.gesture = null
      this.lock = false
      this.lastX = [0, 0, 0];
      this.lastY = [0, 0, 0];

      // 从transform提取container当前坐标
      let computedStyle = getComputedStyle(this.container, null)
      let transform = computedStyle.transform.split(", ")
      this.translateStartX = parseInt(transform[4])
      this.translateStartY = parseInt(transform[5])

      this.emit('touchstart', ev)

   }
   /**
    * 设置移动触点
    * @param {Event} ev 
    * @param {Number} pageX
    * @param {Number} pageY
    */
   MoveAgent(ev, pageX, pageY) {

      this.pageX = pageX;
      this.pageY = pageY;
      this.moveX = pageX - this.startX;
      this.moveY = pageY - this.startY;

      // 手势识别
      this.gestureRecognition(ev)

   }
   /**
    * 触点释放
    */
   EndAgent(ev) {

      // 触点释放后的滑动方向判断
      // 计算触点释放时的位移差值，假设触发事件的时间周期固定，位移差可以间接反应位移速度
      let last = this['last' + this.dir]
      this.shift = last[2] - last[0]

      // 正向滑动
      if (this.shift > this.distance) {
         this.emit('touchend-LT', ev)
      }

      // 反向滑动
      else if (this.shift < -this.distance) {
         this.emit('touchend-RB', ev)
      }

      this.emit('touchend', ev)

   }
   /**
    * 手势识别
    */
   gestureRecognition(ev) {

      // 由于触控屏的点阵特性，导致Touch事件的非线性输出，为了避免临界点抖动，取最后三个page坐标求差值
      this.lastX = [this.lastX[1], this.lastX[2], this.pageX];
      this.lastY = [this.lastY[1], this.lastY[2], this.pageY];

      // 手势识别成功
      if (this.gesture) {
         this.emit('touchmove', ev)
      }

      // 手势识别状态
      else {

         // 滑动方向判断，通过起点圆周判坐标比值判断
         let moveX = Math.abs(this.moveX)

         let moveY = Math.abs(this.moveY)

         // 超出起始无效自由滑动区域时确认手势
         if (moveX > this.slideGap || moveY > this.slideGap) {

            // 水平滑动
            if (moveX > moveY) {
               this.gesture = 'level'
            }

            // 垂直滑动
            else {
               this.gesture = 'vertical'
            }

            // 未匹配到指定的手势时，禁用Touch
            if (this.gesture !== this.direction) {
               this.lock = true
            }

         }

      }

   }
}

export default Base