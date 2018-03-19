'use strict';

export default function (options = {}) {

   let { el } = this;

   let { clientWidth, children, firstElementChild, lastElementChild } = el;

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

      el.style.transitionProperty = `transform`;

      // 如果只有一个子元素则关闭轮播
      if (this.amount === 0) this.loop = false

      // 循环模式时创建闭环节点
      if (this.loop) {

         // 首尾添加交叉重叠元素
         el.appendChild(firstElementChild.cloneNode(true));
         el.insertBefore(lastElementChild.cloneNode(true), el.children[0]);
         this.amount += 2;
         this.current = this.position;

      } else {

         // 非循环模式下元素实际起始位从0开始
         this.current = this.position - 1;

      }

      let translateX = this.clientWidth * this.current;

      el.style.transform = `translateX(${-translateX}px)`;

      // 使用绝对定位，子节点相对父节点位置始终保持固定
      for (let i = 0; i < children.length; i++) {
         let item = children[i];
         item.style.left = `${i}00%`;
      }

      let autoPlay = () => {
         if (this.autoPlay) {
            if (this.current === this.amount) {
               this.current = 1;
               el.style.transform = `translateX(${-this.clientWidth}px)`;
               el.style.transitionDuration = "0ms";
            }
            this.timeID = setTimeout(() => {
               if (this.current < this.amount) {
                  let X = ++this.current * this.clientWidth;
                  el.style.transitionDuration = "450ms";
                  el.style.transitionTimingFunction = "ease";
                  el.style.transform = `translateX(${-X}px)`;
                  autoPlay();
               }
            }, this.autoPlay);
         }
      }

      // 自动轮播
      autoPlay();

      this.on('touchstart', () => {
         this.autoPlay && clearTimeout(this.timeID);
         this.el.style.transform = `translateX(${this.translateStartX}px)`;
         this.el.style.transitionDuration = "0ms";
      })

      this.on("touchmove", () => {

         // 手势匹配成功
         if (this.direction) {

            el.style.transitionDuration = "0ms";

            if (this.loop) {

               // 循环模式换向
               this.translateX = this.translateStartX + this.moveX;
               if (this.translateX >= 0) {
                  this.current = this.amount - 1;
                  this.translateX = -this.clientWidth * (this.amount - 1) + this.moveX;
               } else if (this.translateX <= -this.clientWidth * this.amount) {
                  this.current = 1;
                  this.translateX = -this.clientWidth * 1 + this.moveX
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
                  this.moveX = this.moveX / this.damping
               }
               this.translateX = this.translateStartX + this.moveX;

            }

            el.style.transform = `translateX(${this.translateX}px)`;

            // 手势识别成功后的touchmove，供开发者调用
            this.move && this.move.call(this);

         }

         // 手势匹配阶段direction为undefined，失败后为false
         else if (this.direction === undefined) {

            // 滑动方向判断，通过起点圆周判坐标比值判断
            let moveX = Math.abs(this.moveX)
            let moveY = Math.abs(this.moveY)

            // 超出滑动起始范围时锁定手势判断
            if (moveX > this.slideGap || moveY > this.slideGap) {

               if (moveY === 0) {
                  this.direction = 1
               } else {
                  let difference = moveX / moveY
                  if (difference > 1.5) {
                     this.direction = 1
                  }
                  // 匹配失败
                  else {
                     this.direction = false
                  }
               }

               // 初始滑动自由间隙补偿
               if (this.moveX > 0) {
                  this.startX += this.slideGap
               } else if (this.moveX < 0) {
                  this.startX -= this.slideGap
               }

            }

         }

      })

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
         el.style.transform = `translateX(${-X}px)`;
         el.style.transitionDuration = `${this.transitionDuration}ms`;
         el.style.transitionTimingFunction = "ease-out";

         this.direction = undefined

         autoPlay();

      })
   }

   return this;

}