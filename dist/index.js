(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.lightTouch = factory());
}(this, (function () { 'use strict';

class touch {
   constructor(el) {
      this.el = el;
      this.moveTasks = [];
      this.endTasks = [];
      this.moveRatio = 0;
      this.moveX = 0;
      this.moveY = 0;
      this.pageX = 0;
      this.pageY = 0;
   }
   _tasks(move, end) {
      if (move) {
         this.moveTasks.push(move);
      }
      if (end) {
         this.endTasks.push(end);
      }
   }
   slide(move, end) {
      this._tasks(function (ev, newObject) {
         let x = Math.round(newObject.pageX - newObject.elementX);
         let y = Math.round(newObject.pageY - newObject.elementY);
         newObject.el.setAttribute("style", `transform:translate(${x}px, ${y}px)`);
         move && move(ev, newObject);
         return true;
      }, end);
      return this;
   }
   slideX(move, end) {
      this._tasks(function (ev, data) {
         let { moveRatio } = data;
         if (moveRatio > 1.8) {
            let x = Math.round(data.pageX - data.elementX);
            data.el.style.transform = `translateX(${x}px)`;
            move && move(ev, data);
            return true;
         }
      }, end);
      return this;
   }
   slideY(move, end) {
      this._tasks(function (ev, newObject) {
         let { moveRatio } = newObject;
         if (moveRatio < 0.3) {
            let y = Math.round(newObject.pageY - newObject.elementY);
            newObject.el.style.transform = `translateY(${y}px)`;
            move && move(ev, newObject);
            return true;
         }
      }, end);
      return this;
   }
}

function main (el) {

   if (typeof el === 'string') {
      el = document.querySelector(el);
   } else if (typeof el !== 'newObject') {
      console.error('touch选择器数据类型无效');
      return
   }

   if (!el) {
      console.error('touch选择器找不到目标元素');
      return
   }

   let newTouch = new touch(el);

   el.addEventListener("touchstart", function (ev) {
      let [{ pageX, pageY }] = ev.changedTouches;
      newTouch.startX = pageX;
      newTouch.startY = pageY;
      newTouch.elementX = pageX - newTouch.pageX;
      newTouch.elementY = pageY - newTouch.pageY;
      ev.preventDefault();
      ev.stopPropagation();
   }, false);

   el.addEventListener("touchmove", function (ev) {
      let [{ pageX, pageY }] = ev.changedTouches;
      newTouch.pageX = pageX;
      newTouch.pageY = pageY;
      // 如果task方法存在表示已经识别手势，直接执行手势对应回调函数，不再重复判断手势。
      if (newTouch.task) {
         newTouch.task(ev, newTouch);
      } else {

         newTouch.moveX = Math.abs(pageX - newTouch.startX);
         newTouch.moveY = Math.abs(pageY - newTouch.startY);

         if (newTouch.moveX) {
            newTouch.moveRatio = 2;
         } else if (newTouch.moveY) {
            newTouch.moveRatio = 0;
         } else {
            newTouch.moveRatio = newTouch.moveX / newTouch.moveY;
         }

         for (let task of newTouch.moveTasks) {
            // 如果task返回值为true，则表示手势匹配成功
            if (task(ev, newTouch)) {
               newTouch.task = task;
            }
         }
      }
      ev.preventDefault();
      ev.stopPropagation();
   }, false);

   el.addEventListener("touchend", function (ev) {
      let [{ pageX, pageY }] = ev.changedTouches;
      newTouch.pageX = pageX - newTouch.elementX;
      newTouch.pageY = pageY - newTouch.elementY;
      delete newTouch.task;
      for (let task of newTouch.endTasks) {
         task(ev);
      }
      ev.preventDefault();
      ev.stopPropagation();
   }, false);

   return newTouch;

}

return main;

})));
