export default {
   name: "loop",
   values: {
      true: {
         /**
          * 初始化
          */
         initial() {

            let { children, firstElementChild, lastElementChild } = this.container;

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

            let translate = translateStart + move

            // 正向切换
            if (translate >= 0) {
               this["translate" + dir] = translate + -complement
            }

            // 反向切换
            else if (translate <= -containerWHV - -WHV) {
               this["translate" + dir] = translate + complement
            }

            // 居间
            else {
               this["translate" + dir] = translate
            }

         },
         /**
          * 导航
          */
         navigation() {}
      },
      false: {
         initial() {
            // 非循环模式下元素起始位从0开始
            this.pid = this.position - 1;
         },
         prev() {
            if (this.pid > 1) {
               --this.pid;
               if (this.navigation) {
                  this.nextEl.style.display = 'block'
                  this.prevEl.style.display = 'block'
               }
            } else if (this.pid === 1) {
               --this.pid;
               if (this.navigation) {
                  this.prevEl.style.display = 'none'
               }
            }
         },
         next() {
            if (this.pid < this.elementCount - 2) {
               ++this.pid
               if (this.navigation) {
                  this.nextEl.style.display = 'block'
                  this.prevEl.style.display = 'block'
               }
            }
            else if (this.pid === this.elementCount - 2) {
               ++this.pid
               if (this.navigation) {
                  this.nextEl.style.display = 'none'
               }
            }
         },
         touchmove({ move, translateStart, dir }) {
            // 右端滑动
            if (move > 0 && this.pid === 0) {
               move = move / this.damping
            }

            // 左端滑动
            else if (move < 0 && this.pid === this.elementCount - 1) {
               move = move / this.damping
            }

            this["translate" + dir] = translateStart + move
         },
         navigation() {
            if (this.pid === 0) {
               this.prevEl.style.display = 'none';
            }
            if (this.pid === this.elementCount - 1) {
               this.nextEl.style.display = 'none';
            }
         }
      }
   }
}