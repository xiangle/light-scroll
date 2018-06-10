'use strict';

let mixing = {
   loop: false,
   autoPlay: 3600,
   transitionDuration: 300,
   damping: 6,
   position: 1,
}

/**
 * 刷卡
 * this绑定Touch类实例
 * @param {*} options 
 */
export default function (options = {}) {

   Object.assign(this, mixing, options);

   let { touchBox } = this;

   let { children, clientWidth, childElementCount, style, firstElementChild, lastElementChild } = touchBox;

   if (childElementCount) {

      style.transitionDuration = '0ms'

      // 子集批量添加Style样式
      for (let item of children) {
         item.style.width = clientWidth + 'px'
         item.style.overflow = 'hidden'
         item.style.float = 'left'
      }

      // 循环模式下创建闭环节点
      if (this.loop) {

         // 首尾添加交叉重叠元素
         touchBox.appendChild(firstElementChild.cloneNode(true));
         touchBox.insertBefore(lastElementChild.cloneNode(true), children[0]);

         // 设定容器的起始坐标
         style.transform = `translate3d(${-clientWidth}px, 0px, 0px)`;

         childElementCount += 2;
         this.pid = this.position;

      } else {

         // 非循环模式下元素起始位从0开始
         this.pid = this.position - 1;

         style.transform = `translate3d(0px, 0px, 0px)`;

      }

      let touchBoxWidth = clientWidth * childElementCount;

      style.width = touchBoxWidth + 'px';

      let autoPlay = () => {

         if (this.autoPlay) {

            // if (this.loop) {
            //    if (this.pid === childElementCount) {
            //       this.pid = 1;
            //       style.transform = `translate3d(${-clientWidth}px, 0px, 0px)`;
            //       style.transitionDuration = "0ms";
            //    }
            // }

            this.timeID = setTimeout(() => {
               if (this.pid < childElementCount) {
                  let X = ++this.pid * clientWidth;
                  style.transitionDuration = "450ms";
                  // style.transitionTimingFunction = "ease";
                  style.transform = `translate3d(${-X}px, 0px, 0px)`;
                  autoPlay();
               }
            }, this.autoPlay);

         }

      }

      // 自动轮播
      autoPlay();

      // 换向补位
      let complement = clientWidth * (childElementCount - 2)

      this.on('touchstart', ev => {

         // 监听到触点时关闭轮播
         if (this.autoPlay) {
            clearTimeout(this.timeID)
         }

         if (this.translateStartX <= 0) {
            this.touchLock = true
         } else {
            return
         }

         style.transitionDuration = "0ms"

         style.transform = `translate3d(${this.translateStartX}px, 0px, 0px)`

      })

      // touchmove水平
      this.on("touchmove-level", ev => {

         // 循环模式，重合点切换
         if (this.loop) {

            this.translateX = this.translateStartX + this.moveX

            // 正向切换
            if (this.translateX >= 0) {
               this.translateX = this.translateX + -complement
            }

            // 反向切换
            else if (this.translateX <= -touchBoxWidth - -clientWidth) {
               this.translateX = this.translateX + complement
            }

         }

         // 非循环模式，两端使用缓速滑动
         else {

            // 右端滑动
            if (this.moveX > 0 && this.pid === 0) {
               this.moveX = this.moveX / this.damping
            }

            // 左端滑动
            else if (this.moveX < 0 && this.pid === childElementCount - 1) {
               this.moveX = this.moveX / this.damping
            }

            this.translateX = this.translateStartX + this.moveX

         }

         style.transform = `translate3d(${this.translateX}px, 0px, 0px)`

         this.move && this.move.call(this)

      })

      // touchend右
      this.on("touchend-right", ev => {

         if (this.loop) {

            // 限制连续滑动时，同一个target、同一个方向只允许触发一次
            // if (ev.target === this.target && this.direction === 'right') {
            //    return
            // }

            if (this.pid > 0) {
               --this.pid
            }
            // 换位
            else {
               this.pid = childElementCount - 3

               // 当进行连续快速滑动时，在上一个卡片还没有完全移出的过渡状态下就触发了下一个卡片的滑动事件，且在未抵达换位点前就释放了触点，因此无法再通过touchmove事件进行换位，导致换位中断。
               // if (this.swap === false) {
               //    this.translateX = this.translateX + clientWidth * 1
               // }

            }

            // this.target = ev.target
            // this.direction = 'right'

         } else {

            if (this.pid > 0) {
               --this.pid;
            }

         }

      })

      // touchend左
      this.on("touchend-left", ev => {

         if (this.loop) {

            // 限制连续滑动时，同一个target、同一个方向只允许触发一次
            // if (ev.target === this.target && this.direction === 'left') {
            //    return
            // }

            if (this.pid === childElementCount - 1) {
               this.pid = 2
            } else {
               ++this.pid
            }

            // this.target = ev.target
            // this.direction = 'left'

         } else {

            if (this.pid < childElementCount - 1) {
               ++this.pid;
            }

         }

      })

      this.on("touchend", ev => {

         // 触点释放时自动回归
         let X = -(clientWidth * this.pid)
         style.transform = `translate3d(${X}px, 0px, 0px)`
         style.transitionDuration = `${this.transitionDuration}ms`
         // style.transitionTimingFunction = "ease-out"

         autoPlay()

      })

   }

   return this

}