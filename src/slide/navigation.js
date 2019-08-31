import helper from '../helper.js';

/**
 * 翻页导航
 * @param {Object} options 导航选择器配置对象
 */
export default function (options) {

   if (options instanceof Object === false) {
      throw new Error(`无效配置`);
   }

   return function (ctx) {

      const { prev, next, disable } = options;

      const prevEl = helper.getElment(prev);
      const nextEl = helper.getElment(next);

      if (!prevEl || !nextEl) {
         throw new Error(`选择器找不到navigation元素`);
      }

      if (ctx.loop === false) {

         const { childElementCount } = ctx.container;

         if (childElementCount <= 1) {
            prevEl.classList.add(disable);
            nextEl.classList.add(disable);
            return;
         }

         if (ctx.index === 0) {
            prevEl.classList.add(disable);
         }

         if (ctx.index === childElementCount - 1) {
            nextEl.classList.add(disable);
         }

         // 上一页
         ctx.on("prev", function () {
            if (ctx.index === 0) {
               prevEl.classList.add(disable);
            } else {
               nextEl.classList.remove(disable);
               prevEl.classList.remove(disable);
            }
         });

         // 下一页
         ctx.on("next", function () {
            const maxIndex = childElementCount - 1;
            if (ctx.index < maxIndex) {
               nextEl.classList.remove(disable);
               prevEl.classList.remove(disable);
            }
            else if (ctx.index === maxIndex) {
               nextEl.classList.add(disable);
            }
         });

      }

      prevEl.addEventListener(ctx.clickType, ev => {
         ev.stopPropagation();
         ctx.emit('end');
         ctx.emit('prev');
      })

      nextEl.addEventListener(ctx.clickType, ev => {
         ev.stopPropagation();
         ctx.emit('end');
         ctx.emit('next');
      })

   }

}