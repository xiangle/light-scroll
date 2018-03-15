'use strict';

import extend from './extend/index.js'

class Touch {
   constructor(el) {
      this.el = el
      this.startX = 0
      this.startY = 0
      this.pageX = 0
      this.pageY = 0
      this.moveX = 0
      this.moveY = 0
      this.lastX = [0, 0, 0]
      this.lastY = [0, 0, 0]
      this.touchstart = []
      this.touchmove = []
      this.touchend = []
   }
   start(func) {
      this.on("touchstart", func)
      return this;
   }
   move(func) {
      this.on("touchmove", func)
      return this;
   }
   end(func) {
      this.on("touchend", func)
      return this;
   }
   on(name, func) {
      if (this[name] instanceof Array) {
         if (func) this[name].push(func.bind(this))
      } else {
         this[name] = func
      }
   }
   emit(name, ev) {
      for (let item of this[name]) {
         item(ev)
      }
   }
}

for (let name in extend) {
   Touch.prototype[name] = extend[name]
}

export default function touchBox(el) {

   if (typeof el === 'string') {
      el = document.querySelector(el);
   } else if (typeof el !== 'object') {
      return
   }

   if (!el) return

   let touch = new Touch(el);

   el.addEventListener("touchstart", function (ev) {
      ev.preventDefault();
      let [{ pageX, pageY }] = ev.changedTouches;
      touch.startX = pageX;
      touch.startY = pageY;
      touch.pageX = pageX;
      touch.pageY = pageY;
      touch.emit('touchstart', ev)
   }, false);

   el.addEventListener("touchmove", function (ev) {
      ev.preventDefault();
      let [{ pageX, pageY }] = ev.changedTouches;
      touch.pageX = pageX;
      touch.pageY = pageY;
      touch.moveX = pageX - touch.startX;
      touch.moveY = pageY - touch.startY;
      // 为降低touch事件的非线性输出产生的精度误差，保留最后三个page用于位差运算
      touch.lastX = [touch.lastX[1], touch.lastX[2], touch.pageX];
      touch.lastY = [touch.lastY[1], touch.lastY[2], touch.pageY];
      touch.emit('touchmove', ev)
   }, false);


   el.addEventListener("touchend", ev => {
      ev.preventDefault();
      touch.emit('touchend', ev)
      touch.lastX = [0, 0, 0]
      touch.lastY = [0, 0, 0]
   }, false);

   return touch;

}