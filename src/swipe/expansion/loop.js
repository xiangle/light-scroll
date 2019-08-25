const disableButton = 'swiper-button-disable';

export default {
   name: "loop",
   options: {
      true: {
         /**
          * 初始化
          */
         initial() {

            const { children, firstElementChild, lastElementChild } = this.container;

            // 首尾添加交叉重叠元素
            this.container.appendChild(firstElementChild.cloneNode(true));
            this.container.insertBefore(lastElementChild.cloneNode(true), children[0]);

            this.elementCount += 2;
            this.pid = this.position;

         },
         /**
          * 上一页
          */
         prev() {
            if (this.pid > 0) {
               --this.pid
            }
            // 换位
            else {
               this.pid = this.elementCount - 3
            }
         },
         /**
          * 下一页
          */
         next() {
            if (this.pid === this.elementCount - 1) {
               this.pid = 2
            } else {
               ++this.pid
            }
         },
         /**
          * 
          */
         touchmove({ move, translateStart, dir, complement, WHV, containerWHV }) {

            const translate = translateStart + move;

            // 正向切换
            if (translate >= 0) {
               this["translate" + dir] = translate + -complement;
            }

            // 反向切换
            else if (translate <= -containerWHV - -WHV) {
               this["translate" + dir] = translate + complement;
            }

            // 居间
            else {
               this["translate" + dir] = translate;
            }

         },
         /**
          * 导航
          */
         navigation() { }
      },
      false: {
         initial() {
            this.pid = this.position - 1; // 非循环模式下元素起始位从0开始
         },
         prev() {
            if (this.pid > 1) {
               --this.pid;
               if (this.navigation) {
                  this.nextEl.classList.remove(disableButton);
                  this.prevEl.classList.remove(disableButton);
               }
            } else if (this.pid === 1) {
               --this.pid;
               if (this.navigation) {
                  this.prevEl.classList.add(disableButton);
               }
            }
         },
         next() {
            if (this.pid < this.elementCount - 2) {
               ++this.pid
               if (this.navigation) {
                  this.nextEl.classList.remove(disableButton);
                  this.prevEl.classList.remove(disableButton);
               }
            }
            else if (this.pid === this.elementCount - 2) {
               ++this.pid
               if (this.navigation) {
                  this.nextEl.classList.add(disableButton);
               }
            }
         },
         touchmove({ move, translateStart, dir }) {
            // 右端滑动
            if (move > 0 && this.pid === 0) {
               move = move / this.damping;
            }

            // 左端滑动
            else if (move < 0 && this.pid === this.elementCount - 1) {
               move = move / this.damping;
            }

            this["translate" + dir] = translateStart + move;

         },
         navigation() {
            if (this.pid === 0) {
               this.prevEl.classList.add(disableButton);
            }
            if (this.pid === this.elementCount - 1) {
               this.nextEl.classList.add(disableButton);
            }
         }
      }
   }
}