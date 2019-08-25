'use strict';

import helper from '../helper.js'

/**
 * 翻页导航
 * @param {Object} navigation 导航选择器配置对象
 */
export default function (navigation) {

   if (!(navigation instanceof Object)) return;

   return function (ctx) {

      ctx.navigation =navigation;

      const { prevEl, nextEl } = navigation;

      if (!prevEl || !nextEl) return

      ctx.prevEl = helper.getElment(prevEl);

      ctx.nextEl = helper.getElment(nextEl);

      if (!ctx.prevEl || !ctx.nextEl) {
         console.error('选择器找不到navigation元素')
         return
      }

      if (ctx.elementCount > 1) {
         ctx.navigation = true
      } else {
         ctx.navigation = false;
         ctx.prevEl.style.display = 'none';
         ctx.nextEl.style.display = 'none';
         return
      }

      ctx.$loop_navigation()

      ctx.prevEl.addEventListener('click', ev => {
         ctx.prev()
         ctx.end()
      })

      ctx.nextEl.addEventListener('click', ev => {
         ctx.next()
         ctx.end()
      })

   }

}