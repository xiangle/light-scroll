let defaults = {
   loop: false,
   distance: 5,
   autoPlay: 3000,
   damping: 5,
   position: 1,
}

export default function (options = {}) {

   let { el } = this;

   let { clientWidth, children, firstElementChild, lastElementChild } = el;

   this.clientWidth = clientWidth;

   if (children.length) {

      Object.assign(this, defaults, options);

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
      }

      this.amount = children.length - 1;
      this.autoPlay && autoPlay(); // 自动轮播

      this.on('touchstart', () => {
         this.autoPlay && clearTimeout(this.timeID);
         let { transform } = getComputedStyle(this.el, null);
         this.translateStartX = Number(transform.split(", ")[4]);
         this.el.style.transform = `translateX(${this.translateStartX}px)`;
         this.el.style.transitionDuration = "0ms";
      })

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

      }

      // 方向判断
      this.on("direction", () => {
         if (this.moveY) {
            if (Math.abs(this.moveX / this.moveY) > 4) {
               this.on("touchmove", slide)
            }
         } else {
            this.on("touchmove", slide)
         }
      })

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

      })

   }

   return this;
}