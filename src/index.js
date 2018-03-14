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
      this.direction = []
   }
   start(func) {
      this.touchstart.push(func);
      return this;
   }
   move(func) {
      if (func) {
         this.direction.push(() => {
            this.touchmove.push(func.bind(this))
         });
      }
      return this;
   }
   end(func) {
      if (func) {
         this.touchend.push(func.bind(this));
      }
      return this;
   }
   transitionend(func) {
      this.el.addEventListener("transitionend", ev => {
         func || func(ev, this)
         ev.preventDefault();
      }, false);
      return this;
   }
   animationstart(func) {
      this.el.addEventListener("animationstart", ev => {
         func || func(ev, this)
         ev.preventDefault();
      }, false);
      return this;
   }
   animationiteration(func) {
      this.el.addEventListener("animationiteration", ev => {
         func || func(ev, this)
         ev.preventDefault();
      }, false);
      return this;
   }
   animationend(func) {
      this.el.addEventListener("animationend", ev => {
         func || func(ev, this)
         ev.preventDefault();
      }, false);
      return this;
   }
   on(name, func) {
      if (this[name]) {
         if (this[name] instanceof Array) {
            this[name].push(func)
         }
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
      // 如果touchmove数组不为空表示已经识别手势，不再重复判断手势。
      if (touch.touchmove.length) {
         touch.emit('touchmove', ev)
      } else {
         touch.emit('direction', ev)
      }
   }, false);


   el.addEventListener("touchend", ev => {
      ev.preventDefault();
      touch.emit('touchend', ev)
      touch.touchmove = [];
   }, false);


   return touch;

}