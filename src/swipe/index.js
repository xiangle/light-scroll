'use strict';

import expansion from './expansion/index.js'

const mixing = {
   loop: false, // 循环模式
   autoplay: 3600, // 自动轮播时间间隔
   transitionDuration: 200, // 动画过渡持续时间
   position: 1, // 卡片起始位置
}

/**
 * 刷卡
 * ctx绑定Touch类实例
 * @param {Object} options 
 */
export default function (options = {}) {

   /**
    * 实例扩展函数
    */
   return function (ctx) {

      ctx.mixing(mixing, options);

      expansion.call(ctx);

      const { container, direction, dir, el } = ctx;

      const { clientWidth, clientHeight } = el;

      const { children, childElementCount, style } = container;

      ctx.elementCount = childElementCount

      if (!ctx.elementCount) {
         return ctx
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
      for (const item of children) {
         item.style[WHN] = WHV + 'px'
      }

      // loop模式初始化
      ctx.$loop_initial();

      ctx['translateStart' + dir] = -WHV * ctx.pid;

      // 设置容器的起始坐标
      style.transform = `translate3d(${ctx.translateStartX}px, ${ctx.translateStartY}px, 0px)`;

      // 设置translateEnd初始值
      ctx['translateEnd' + dir] = -(WHV * ctx.pid);

      // 容器宽高值
      const containerWHV = WHV * ctx.elementCount;

      // style[WHN] = containerWHV + 'px';

      style.transitionDuration = '0ms'

      // 换向补位
      const complement = WHV * (ctx.elementCount - 2)

      // 调整窗口大小
      window.addEventListener('resize', ev => {
         // WHV = ctx.el.clientWidth
         // containerWHV = WHV * ctx.elementCount;
         // style[WHN] = containerWHV + 'px';
         // ctx.translateEndX = -(WHV * ctx.pid)
         // WHV = ctx.el.clientHeight
         // containerWHV = WHV * ctx.elementCount;
         // style[WHN] = containerWHV + 'px';
         // ctx.translateEndY = -(clientHeight * ctx.pid)
         // style.transform = `translate3d(${ctx.translateEndX}px, ${ctx.translateEndY}px, 0px)`
         // for (let item of children) {
         //    item.style[WHN] = WHV + 'px'
         // }
      })

      const autoplay = () => {

         if (ctx.autoplay) {

            // if (ctx.loop) {
            //    if (ctx.pid === ctx.elementCount) {
            //       ctx.pid = 1;
            //       style.transform = `translate3d(${-WHV}px, 0px, 0px)`;
            //       style.transitionDuration = "0ms";
            //    }
            // }

            ctx.timeID = setTimeout(() => {
               if (ctx.pid < ctx.elementCount) {
                  ctx.translateEndX = ++ctx.pid * -WHV;
                  style.transform = `translate3d(${ctx.translateEndX}px, 0px, 0px)`;
                  style.transitionDuration = "450ms";
                  autoplay();
               }
            }, ctx.autoplay);

         }

      }

      ctx.prev = ctx.$loop_prev;

      ctx.next = ctx.$loop_next;

      ctx.end = () => {
         // 触点释放时自动回归
         ctx["translateEnd" + dir] = -(WHV * ctx.pid)
         style.transform = `translate3d(${ctx.translateEndX}px, ${ctx.translateEndY}px, 0px)`
         style.transitionDuration = `${ctx.transitionDuration}ms`
      }

      // 自动轮播
      // autoplay();

      ctx.on('touchstart', ev => {

         // 监听到触点时关闭轮播
         if (ctx.autoplay) {
            clearTimeout(ctx.timeID);
         }

         // 如果translateStart不在translateEnd位置，则禁止操作
         if (ctx["translateStart" + dir] === ctx["translateEnd" + dir]) {
            ctx.touchLock = false
         } else {
            ctx.touchLock = true
            return
         }

         style.transitionDuration = "0ms";

      })

      ctx.on("touchmove", ev => {

         const move = ctx["move" + dir]
         const translateStart = ctx["translateStart" + dir]

         ctx.$loop_touchmove({ move, translateStart, dir, complement, WHV, containerWHV })

         style.transform = `translate3d(${ctx.translateX}px, ${ctx.translateY}px, 0px)`

         // ctx.move && ctx.move.call(ctx)

      })

      // touchend左上
      ctx.on("touchend-LT", ctx.prev)

      // touchend右下
      ctx.on("touchend-RB", ctx.next)

      ctx.on("touchend", ev => {

         ctx.end();

         // autoplay()

      })

      return ctx;

   }

}