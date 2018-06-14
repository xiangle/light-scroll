'use strict';

import Tools from '../tools'

/**
 * 翻页导航
 * @param {Object} navigation 导航选择器配置对象
 */
export default function (navigation) {

   if (!(navigation instanceof Object)) return

   let { prevEl, nextEl } = navigation

   if (!prevEl || !nextEl) return

   this.prevEl = Tools.getElment(prevEl)

   this.nextEl = Tools.getElment(nextEl)

   if (!this.prevEl || !this.nextEl) {
      console.error('选择器找不到navigation元素')
      return
   }

   if (this.elementCount > 1) {
      this.navigation = true
   } else {
      this.navigation = false
      this.prevEl.style.display = 'none';
      this.nextEl.style.display = 'none';
      return
   }

   this.$loop_navigation()

   this.prevEl.addEventListener('click', ev => {
      this.prev()
      this.end()
   })

   this.nextEl.addEventListener('click', ev => {
      this.next()
      this.end()
   })

}