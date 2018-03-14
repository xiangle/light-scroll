(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.touchBox = factory());
}(this, (function () { 'use strict';

let defaults = {
   distance: 5,
   damping: 5,
};

function scroll (options = {}) {

   Object.assign(options, defaults);

   let autoPlay = () => {
      this.timeID = setTimeout(() => {
         if (this.current < this.amount) {
            let X = ++this.current * this.clientWidth;
            this.el.style.transitionDuration = "450ms";
            this.el.style.transitionTimingFunction = "ease";
            this.el.style.transform = `translateX(${-X}px)`;
            this.carousel();
         }
      }, options.autoPlay);
   };

   let scrollX = () => {
      this.translateX = this.translateStartX + this.moveX;
      this.el.style.transform = `translateX(${this.translateX}px)`;
      options.move && options.move.call(this);
   };

   this.el.style.transform = `translateX(0px)`;

   this.touchstart.push(() => {
      let { transform } = getComputedStyle(this.el, null);
      this.translateStartX = Number(transform.split(", ")[4]);
   });

   this.gesture.push(() => {
      if (this.moveY) {
         if (Math.abs(this.moveX / this.moveY) > 4) {
            this.touchmove.push(scrollX);
         }
      } else {
         this.touchmove.push(scrollX);
      }
   });

   this.touchend.push(() => {
      options.autoPlay && autoPlay();
   });

   return this;
}

let defaults$1 = {
   loop: false,
   distance: 5,
   autoPlay: 3000,
   damping: 5,
   position: 1,
};

function slide (options = {}) {

   let { el } = this;

   let { clientWidth, children, firstElementChild, lastElementChild } = el;

   this.clientWidth = clientWidth;

   if (children.length) {

      Object.assign(this, defaults$1, options);

      el.style.transitionProperty = `transform`;
      el.style.transform = `translateX(0px)`;

      // 循环模式时创建重叠闭环节点
      if (this.loop) {

         this.current = this.position;
         el.style.transform = `translateX(${-clientWidth}px)`;
         el.appendChild(firstElementChild.cloneNode(true));
         el.insertBefore(lastElementChild.cloneNode(true), el.children[0]);

         // 在过渡结束后，对重合元素进行换向操作
         el.addEventListener("transitionend", () => {
            if (this.current === 0) {
               this.current = this.amount - 1;
               let X = this.clientWidth * this.current;
               el.style.transform = `translateX(${-X}px)`;
               el.style.transitionDuration = "0ms";
            } else if (this.current === this.amount) {
               this.current = 1;
               el.style.transform = `translateX(${-this.clientWidth}px)`;
               el.style.transitionDuration = "0ms";
            }
         }, false);

      } else {
         this.current = 0;
         el.style.transform = `translateX(0px)`;
      }

      // 使用绝对定位，子节点相对父节点位置始终保持固定
      for (let i = 0; i < children.length; i++) {
         let item = children[i];
         item.style.left = `${i}00%`;
      }

      let autoPlay = () => {
         this.timeID = setTimeout(() => {
            if (this.current < this.amount) {
               let X = ++this.current * this.clientWidth;
               el.style.transitionDuration = "450ms";
               el.style.transitionTimingFunction = "ease";
               el.style.transform = `translateX(${-X}px)`;
               autoPlay();
            }
         }, this.autoPlay);
      };

      this.amount = children.length - 1;
      this.autoPlay && autoPlay(); // 自动轮播

      this.on('touchstart', () => {
         this.autoPlay && clearTimeout(this.timeID);
         let { transform } = getComputedStyle(this.el, null);
         this.translateStartX = Number(transform.split(", ")[4]);
         this.el.style.transform = `translateX(${this.translateStartX}px)`;
         this.el.style.transitionDuration = "0ms";
      });

      let slide = () => {

         // 为降低touch事件的非线性输出特性产生的进度误差，保存最后三个pageX进行位差运算
         this.lastX = [this.lastX[1], this.lastX[2], this.pageX];
         this.lastY = [this.lastY[1], this.lastY[2], this.pageY];

         if (!this.loop) {
            // 非循环模式下，末端滑动使用阻尼效果
            if (this.current === 0) {
               if (this.moveX > 0) this.moveX = this.moveX / this.damping;
            } else if (this.current === this.amount) {
               if (this.moveX < 0) this.moveX = this.moveX / this.damping;
            }
         }

         this.translateX = this.translateStartX + this.moveX;
         el.style.transform = `translateX(${this.translateX}px)`;

         this.move && this.move.call(this);

      };

      // 方向判断
      this.on("direction", () => {
         if (this.moveY) {
            if (Math.abs(this.moveX / this.moveY) > 4) {
               this.on("touchmove", slide);
            }
         } else {
            this.on("touchmove", slide);
         }
      });

      this.on("touchend", () => {

         // 计算位移差值，使用移动端优先原则，忽略PC端touchend事件差异
         let shiftX = this.lastX[2] - this.lastX[0];
         if (shiftX > this.distance) {
            if (this.loop) {
               --this.current;
            } else {
               if (this.current > 0) {
                  --this.current;
               }
            }
         } else if (shiftX < -this.distance) {
            if (this.loop) {
               ++this.current;
            } else {
               if (this.current < this.amount) {
                  ++this.current;
               }
            }
         }

         let X = this.clientWidth * this.current;
         el.style.transform = `translateX(${-X}px)`;
         el.style.transitionDuration = "300ms";
         el.style.transitionTimingFunction = "ease-out";

         this.autoPlay && autoPlay();

      });

   }

   return this;
}

var extend = {
   scroll,
   slide,
}

class Touch {
   constructor(el) {
      this.el = el;
      this.startX = 0;
      this.startY = 0;
      this.pageX = 0;
      this.pageY = 0;
      this.moveX = 0;
      this.moveY = 0;
      this.lastX = [0, 0, 0];
      this.lastY = [0, 0, 0];
      this.touchstart = [];
      this.touchmove = [];
      this.touchend = [];
      this.direction = [];
   }
   start(func) {
      this.touchstart.push(func);
      return this;
   }
   move(func) {
      if (func) {
         this.direction.push(() => {
            this.touchmove.push(func.bind(this));
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
         func || func(ev, this);
         ev.preventDefault();
      }, false);
      return this;
   }
   animationstart(func) {
      this.el.addEventListener("animationstart", ev => {
         func || func(ev, this);
         ev.preventDefault();
      }, false);
      return this;
   }
   animationiteration(func) {
      this.el.addEventListener("animationiteration", ev => {
         func || func(ev, this);
         ev.preventDefault();
      }, false);
      return this;
   }
   animationend(func) {
      this.el.addEventListener("animationend", ev => {
         func || func(ev, this);
         ev.preventDefault();
      }, false);
      return this;
   }
   on(name, func) {
      if (this[name]) {
         if (this[name] instanceof Array) {
            this[name].push(func);
         }
      } else {
         this[name] = func;
      }
   }
   emit(name, ev) {
      for (let item of this[name]) {
         item(ev);
      }
   }
}

for (let name in extend) {
   Touch.prototype[name] = extend[name];
}

function touchBox(el) {

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
      touch.emit('touchstart', ev);
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
         touch.emit('touchmove', ev);
      } else {
         touch.emit('direction', ev);
      }
   }, false);


   el.addEventListener("touchend", ev => {
      ev.preventDefault();
      touch.emit('touchend', ev);
      touch.touchmove = [];
   }, false);


   return touch;

}

return touchBox;

})));
