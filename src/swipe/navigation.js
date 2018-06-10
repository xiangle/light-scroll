'use strict';

import Tools from '../tools'

export default function (navigation) {

   if (!(navigation instanceof Object)) return

   let { nextEl, prevEl } = navigation

   if (!nextEl || !prevEl) return

   nextEl = Tools.getElment(nextEl)

   prevEl = Tools.getElment(prevEl)

   if (!nextEl || !prevEl) {
      console.error('选择器找不到navigation元素')
      return
   }

   nextEl.addEventListener('click', ev => {
      this.next()
      this.end()
   })

   prevEl.addEventListener('click', ev => {
      this.prev()
      this.end()
   })

}