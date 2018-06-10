'use strict';

import Tools from '../tools'

export default function (navigation) {

   if (!(navigation instanceof Object)) return

   let { nextEl, prevEl } = navigation

   if (!nextEl || !prevEl) return

   this.nextEl = Tools.getElment(nextEl)

   this.prevEl = Tools.getElment(prevEl)

   if (!this.nextEl || !this.prevEl) {
      console.error('选择器找不到navigation元素')
      return
   }

   this.navigation = true
   
   this.prevEl.addEventListener('click', ev => {
      this.prev()
      this.end()
   })

   this.nextEl.addEventListener('click', ev => {
      this.next()
      this.end()
   })

}