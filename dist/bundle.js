var touchBox = (function () {
'use strict';

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

function slide (options = {}) {

   let { el } = this;

   let { clientWidth, children, style, firstElementChild, lastElementChild } = el;

   if (children.length) {

      this.amount = children.length - 1;

      this.totalWidth = clientWidth * children.length;

      this.clientWidth = clientWidth;

      Object.assign(this, {
         slideGap: 5,
         loop: false,
         distance: 5,
         autoPlay: 3600,
         transitionDuration: 300,
         damping: 6,
         position: 1,
      }, options);

      style.transitionProperty = `transform`;

      // 如果只有一个子元素则关闭轮播
      if (this.amount === 0) this.loop = false;

      // 循环模式时创建闭环节点
      if (this.loop) {

         // 首尾添加交叉重叠元素
         el.appendChild(firstElementChild.cloneNode(true));
         el.insertBefore(lastElementChild.cloneNode(true), children[0]);
         this.amount += 2;
         this.current = this.position;

      } else {

         // 非循环模式下元素实际起始位从0开始
         this.current = this.position - 1;

      }

      let translateX = this.clientWidth * this.current;

      style.transform = `translateX(${-translateX}px)`;

      style.width = `${children.length}00%`;

      // 使用flex自动分配空间后，取消了js分配width
      // let itemWidth = 100 / children.length
      // for (let i = 0; i < children.length; i++) {
      //    let item = children[i];
      //    item.style.width = `${itemWidth}%`;
      // }

      let autoPlay = () => {
         if (this.autoPlay) {
            // if (this.loop) {
            //    if (this.current === this.amount) {
            //       this.current = 1;
            //       style.transform = `translateX(${-this.clientWidth}px)`;
            //       style.transitionDuration = "0ms";
            //    }
            // }
            this.timeID = setTimeout(() => {
               if (this.current < this.amount) {
                  let X = ++this.current * this.clientWidth;
                  style.transitionDuration = "450ms";
                  style.transitionTimingFunction = "ease";
                  style.transform = `translateX(${-X}px)`;
                  autoPlay();
               }
            }, this.autoPlay);
         }
      };

      // 自动轮播
      autoPlay();

      this.on('touchstart', () => {
         this.autoPlay && clearTimeout(this.timeID);
         style.transform = `translateX(${this.translateStartX}px)`;
         style.transitionDuration = "0ms";
      });

      this.on("touchmove", () => {

         // 手势匹配成功
         if (this.direction) {

            style.transitionDuration = "0ms";

            if (this.loop) {

               // 循环模式换向
               this.translateX = this.translateStartX + this.moveX;
               if (this.translateX >= 0) {
                  this.current = this.amount - 1;
                  this.translateX = -this.clientWidth * (this.amount - 1) + this.moveX;
               } else if (this.translateX <= -this.clientWidth * this.amount) {
                  this.current = 1;
                  this.translateX = -this.clientWidth * 1 + this.moveX;
               }

            } else {

               // 非循环模式下，末端使用缓速滑动
               if (this.amount) {
                  if (this.current === 0) {
                     if (this.moveX > 0) {
                        this.moveX = this.moveX / this.damping;
                     }
                  } else if (this.current === this.amount) {
                     if (this.moveX < 0) {
                        this.moveX = this.moveX / this.damping;
                     }
                  }
               } else {
                  this.moveX = this.moveX / this.damping;
               }
               this.translateX = this.translateStartX + this.moveX;

            }

            style.transform = `translateX(${this.translateX}px)`;

            // 手势识别成功后的touchmove，供开发者调用
            this.move && this.move.call(this);

         }

         // 手势匹配阶段direction为undefined，失败后为false
         else if (this.direction === undefined) {

            // 滑动方向判断，通过起点圆周判坐标比值判断
            let moveX = Math.abs(this.moveX);
            let moveY = Math.abs(this.moveY);

            // 超出滑动起始范围时锁定手势判断
            if (moveX > this.slideGap || moveY > this.slideGap) {

               if (moveY === 0) {
                  this.direction = 1;
               } else {
                  let difference = moveX / moveY;
                  if (difference > 1.5) {
                     this.direction = 1;
                  }
                  // 匹配失败
                  else {
                     this.direction = false;
                  }
               }

               // 初始滑动自由间隙补偿
               if (this.moveX > 0) {
                  this.startX += this.slideGap;
               } else if (this.moveX < 0) {
                  this.startX -= this.slideGap;
               }

            }

         }

      });

      this.on("touchend", () => {

         if (this.direction) {

            this.translateX = this.translateStartX + this.moveX;

            if (this.translateX > -this.clientWidth * this.current) {

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

            } else if (this.translateX < -this.clientWidth * this.current) {

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
            }

            // console.log(this.translateX < -this.clientWidth * this.current);
            // console.log(this.translateX, this.clientWidth, this.current);

         }

         // 点击后释放自动返回目标位置
         let X = this.clientWidth * this.current;
         style.transform = `translateX(${-X}px)`;
         style.transitionDuration = `${this.transitionDuration}ms`;
         style.transitionTimingFunction = "ease-out";

         this.direction = undefined;

         autoPlay();

      });
   }

   return this;

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
   }
   start(func) {
      this.on("touchstart", func);
      return this;
   }
   move(func) {
      this.on("touchmove", func);
      return this;
   }
   end(func) {
      this.on("touchend", func);
      return this;
   }
   on(name, func) {
      if (!func) return
      if (this[name] instanceof Array) {
         this[name].push(func.bind(this));
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

Touch.prototype.scroll = scroll;
Touch.prototype.slide = slide;

function main (el) {

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
      touch.computedStyle = getComputedStyle(touch.el, null);
      touch.translateStartX = Number(touch.computedStyle.transform.split(", ")[4]);
      touch.emit('touchstart', ev);
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
      touch.emit('touchmove', ev);
   }, false);


   el.addEventListener("touchend", ev => {
      ev.preventDefault();
      touch.emit('touchend', ev);
      touch.lastX = [0, 0, 0];
      touch.lastY = [0, 0, 0];
   }, false);

   return touch;

}

return main;

}());
