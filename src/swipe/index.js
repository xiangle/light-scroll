'use strict';

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

   // 上一页、下一页导航
   navigation.call(this, options.navigation)

   // 分页导航
   pagination.call(this, options.pagination)

   let { container, direction, dir, el } = this

   let { clientWidth, clientHeight } = el

   let { children, childElementCount, style } = container;

   if (!childElementCount) {
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

   // 循环模式下创建闭环节点
   if (this.loop) {

      let { firstElementChild, lastElementChild } = container;

      // 首尾添加交叉重叠元素
      container.appendChild(firstElementChild.cloneNode(true));
      container.insertBefore(lastElementChild.cloneNode(true), children[0]);

      childElementCount += 2;
      this.pid = this.position;

   } else {

      // 非循环模式下元素起始位从0开始
      this.pid = this.position - 1;

   }

   this['translateStart' + dir] = -WHV * this.pid

   // 设置容器的起始坐标
   style.transform = `translate3d(${this.translateStartX}px, ${this.translateStartY}px, 0px)`;

   // 设置translateEnd初始值
   this['translateEnd' + dir] = -(WHV * this.pid);

   // 容器宽高值
   let containerWHV = WHV * childElementCount;

   style[WHN] = containerWHV + 'px';

   style.transitionDuration = '0ms'

   // 换向补位
   let complement = WHV * (childElementCount - 2)

   // 调整窗口大小
   window.addEventListener('resize', ev => {
      // WHV = this.el.clientWidth
      // containerWHV = WHV * childElementCount;
      // style[WHN] = containerWHV + 'px';
      // this.translateEndX = -(WHV * this.pid)
      // WHV = this.el.clientHeight
      // containerWHV = WHV * childElementCount;
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
         //    if (this.pid === childElementCount) {
         //       this.pid = 1;
         //       style.transform = `translate3d(${-WHV}px, 0px, 0px)`;
         //       style.transitionDuration = "0ms";
         //    }
         // }

         this.timeID = setTimeout(() => {
            if (this.pid < childElementCount) {
               this.translateEndX = ++this.pid * -WHV;
               style.transform = `translate3d(${this.translateEndX}px, 0px, 0px)`;
               style.transitionDuration = "450ms";
               autoplay();
            }
         }, this.autoplay);

      }

   }

   this.prev = () => {
      if (this.loop) {
         if (this.pid > 0) {
            --this.pid
         }
         // 换位
         else {
            this.pid = childElementCount - 3
         }
      } else {
         if (this.pid > 1) {
            --this.pid;
            if (this.navigation) {
               this.nextEl.style.display = 'block'
               this.prevEl.style.display = 'block'
            }
         } else if (this.pid === 1) {
            --this.pid;
            if (this.navigation) {
               this.prevEl.style.display = 'none'
            }
         }
      }
   }

   this.next = () => {
      if (this.loop) {
         if (this.pid === childElementCount - 1) {
            this.pid = 2
         } else {
            ++this.pid
         }
      } else {
         if (this.pid < childElementCount - 2) {
            ++this.pid
            if (this.navigation) {
               this.nextEl.style.display = 'block'
               this.prevEl.style.display = 'block'
            }
         }
         else if (this.pid === childElementCount - 2) {
            ++this.pid
            if (this.navigation) {
               this.nextEl.style.display = 'none'
            }
         }
      }
   }

   this.end = () => {
      // 触点释放时自动回归
      this["translateEnd" + dir] = -(WHV * this.pid)
      style.transform = `translate3d(${this.translateEndX}px, ${this.translateEndY}px, 0px)`
      style.transitionDuration = `${this.transitionDuration}ms`
   }

   // 自动轮播
   // autoplay();

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

      // 循环模式，重合点切换
      if (this.loop) {

         let translate = translateStart + move

         // 正向切换
         if (translate >= 0) {
            this["translate" + dir] = translate + -complement
         }

         // 反向切换
         else if (translate <= -containerWHV - -WHV) {
            this["translate" + dir] = translate + complement
         }

         // 居间
         else {
            this["translate" + dir] = translate
         }

      }

      // 非循环模式，两端使用缓速滑动
      else {

         // 右端滑动
         if (move > 0 && this.pid === 0) {
            move = move / this.damping
         }

         // 左端滑动
         else if (move < 0 && this.pid === childElementCount - 1) {
            move = move / this.damping
         }

         this["translate" + dir] = translateStart + move

      }

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