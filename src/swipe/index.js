'use strict';

import injection from './injection/index.js'
import navigation from './navigation'
import pagination from './pagination'

let mixing = {
   loop: false, // 循环模式
   autoplay: 3600, // 自动轮播时间间隔
   transitionDuration: 200, // 动画过渡持续时间
   position: 1, // 卡片起始位置
}

/**
 * 刷卡
 * this绑定Touch类实例
 * @param {*} options 
 */
export default function (options = {}) {

   this.mixing(mixing, options)

   // 依赖注入
   injection(this)

   let { container, direction, dir, el } = this

   let { clientWidth, clientHeight } = el

   let { children, childElementCount, style } = container;

   this.elementCount = childElementCount

   if (!this.elementCount) {
      return this
   }

   let WHN // 宽高name
   let WHV // 宽高value
   if (direction === 'level') {
      WHN = 'width'
      WHV = clientWidth
   } else {
      WHN = 'height'
      WHV = clientHeight
   }

   // 子集批量添加Style样式
   for (let item of children) {
      item.style[WHN] = WHV + 'px'
   }

   // loop模式初始化
   this.$loop_initial()

   this['translateStart' + dir] = -WHV * this.pid

   // 设置容器的起始坐标
   style.transform = `translate3d(${this.translateStartX}px, ${this.translateStartY}px, 0px)`;

   // 设置translateEnd初始值
   this['translateEnd' + dir] = -(WHV * this.pid);

   // 容器宽高值
   let containerWHV = WHV * this.elementCount;

   // style[WHN] = containerWHV + 'px';

   style.transitionDuration = '0ms'

   // 换向补位
   let complement = WHV * (this.elementCount - 2)

   // 调整窗口大小
   window.addEventListener('resize', ev => {
      // WHV = this.el.clientWidth
      // containerWHV = WHV * this.elementCount;
      // style[WHN] = containerWHV + 'px';
      // this.translateEndX = -(WHV * this.pid)
      // WHV = this.el.clientHeight
      // containerWHV = WHV * this.elementCount;
      // style[WHN] = containerWHV + 'px';
      // this.translateEndY = -(clientHeight * this.pid)
      // style.transform = `translate3d(${this.translateEndX}px, ${this.translateEndY}px, 0px)`
      // for (let item of children) {
      //    item.style[WHN] = WHV + 'px'
      // }
   })

   let autoplay = () => {

      if (this.autoplay) {

         // if (this.loop) {
         //    if (this.pid === this.elementCount) {
         //       this.pid = 1;
         //       style.transform = `translate3d(${-WHV}px, 0px, 0px)`;
         //       style.transitionDuration = "0ms";
         //    }
         // }

         this.timeID = setTimeout(() => {
            if (this.pid < this.elementCount) {
               this.translateEndX = ++this.pid * -WHV;
               style.transform = `translate3d(${this.translateEndX}px, 0px, 0px)`;
               style.transitionDuration = "450ms";
               autoplay();
            }
         }, this.autoplay);

      }

   }

   this.prev = this.$loop_prev

   this.next = this.$loop_next

   this.end = () => {
      // 触点释放时自动回归
      this["translateEnd" + dir] = -(WHV * this.pid)
      style.transform = `translate3d(${this.translateEndX}px, ${this.translateEndY}px, 0px)`
      style.transitionDuration = `${this.transitionDuration}ms`
   }

   // 自动轮播
   // autoplay();

   // 上一页、下一页导航
   navigation.call(this, options.navigation)

   // 分页导航
   pagination.call(this, options.pagination)

   this.on('touchstart', ev => {

      // 监听到触点时关闭轮播
      if (this.autoplay) {
         clearTimeout(this.timeID)
      }

      // 如果translateStart不在translateEnd位置，则禁止操作
      if (this["translateStart" + dir] === this["translateEnd" + dir]) {
         this.touchLock = false
      } else {
         this.touchLock = true
         return
      }

      style.transitionDuration = "0ms"

   })

   this.on("touchmove", ev => {

      let move = this["move" + dir]
      let translateStart = this["translateStart" + dir]

      this.$loop_touchmove({ move, translateStart, dir, complement, WHV, containerWHV })

      style.transform = `translate3d(${this.translateX}px, ${this.translateY}px, 0px)`

      // this.move && this.move.call(this)

   })

   // touchend左上
   this.on("touchend-LT", this.prev)

   // touchend右下
   this.on("touchend-RB", this.next)

   this.on("touchend", ev => {

      this.end()

      // autoplay()

   })

   return this

}