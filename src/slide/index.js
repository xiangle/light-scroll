export default function (options = {}) {

   if (options instanceof Object === false) {
      throw new Error(`无效配置`);
   }

   return class {
      constructor(ctx) {

         this.loop = false; // 循环模式
         this.transitionDuration = 200; // 动画过渡持续时间
         this.position = 1; // 卡片起始位置

         Object.assign(this, options);

         ctx.loop = this.loop;

         const { loop, transitionDuration, position } = this;

         const { container, box, direction, dir } = ctx;

         const { childElementCount, style } = container;

         if (!childElementCount) return;

         const { clientWidth, clientHeight } = box;

         let itemWH; // 每个子容器的宽或高
         if (direction === 'level') {
            itemWH = clientWidth;
         } else {
            itemWH = clientHeight;
         }

         const translateStartDir = ['translateStart' + dir];
         const translateDir = ['translate' + dir];
         const translateEndDir = "translateEnd" + dir;

         if (loop) {

            const { children, firstElementChild, lastElementChild } = container;

            // 首尾添加交叉重叠元素
            container.appendChild(firstElementChild.cloneNode(true));
            container.insertBefore(lastElementChild.cloneNode(true), children[0]);

            ctx.index = position;

            // 换向补位
            const complement = itemWH * childElementCount;
            ctx[translateStartDir] = -itemWH * position;

            const afterNode = -(complement + itemWH);

            ctx.on("move", ev => {

               let move = ctx["move" + dir];
               const translateStart = ctx[translateStartDir];
               const translate = translateStart + move;

               // 前重叠换向
               if (translate >= 0) {
                  const value = -complement + move;
                  ctx[translateStartDir] = value;
                  ctx[translateDir] = value;
                  ctx.index = childElementCount;
               }

               // 后重叠换向
               else if (translate < afterNode) {
                  const value = -itemWH + move;
                  ctx[translateStartDir] = value;
                  ctx[translateDir] = value;
                  ctx.index = 1;
               }

               // 正常滑动
               else {
                  ctx[translateDir] = translate;
               }

               style.transform = `translate3d(${ctx.translateX}px, ${ctx.translateY}px, 0px)`;

            })

            //事件结束后自动对齐
            ctx.on("end", function (ev) {

               const move = ctx["move" + dir];
               const translateStart = ctx[translateStartDir];
               const translate = translateStart + move;
               const itemsWH = -(itemWH * ctx.index);

               // 右、上滑动
               if (ctx.shift > ctx.distance) {
                  if (translate > itemsWH) {
                     ctx.index--;
                     ctx[translateEndDir] = itemsWH + itemWH;
                  } else if (translate < itemsWH) {
                     ctx.index++;
                     ctx[translateEndDir] = itemsWH - itemWH;
                  } else {
                     ctx[translateEndDir] = itemsWH;
                  }
               }

               // 左、下滑动
               else if (ctx.shift < -ctx.distance) {
                  if (translate > itemsWH) {
                     ctx.index--;
                     ctx[translateEndDir] = itemsWH + itemWH;
                  } else if (translate < itemsWH) {
                     ctx.index++;
                     ctx[translateEndDir] = itemsWH - itemWH;
                  } else {
                     ctx[translateEndDir] = itemsWH;
                  }
               } else {
                  // 在滑动截止速度方向
                  const halfWH = itemWH / 2;
                  if (translate > itemsWH + halfWH) {
                     ctx.index--;
                     ctx[translateEndDir] = itemsWH + itemWH;
                  } else if (translate < itemsWH - halfWH) {
                     ctx.index++;
                     ctx[translateEndDir] = itemsWH - itemWH;
                  } else {
                     ctx[translateEndDir] = itemsWH;
                  }
               }

               style.transform = `translate3d(${ctx.translateEndX}px, ${ctx.translateEndY}px, 0px)`;
               style.transitionDuration = `${transitionDuration}ms`;

            });

         } else {

            ctx.index = position - 1; // 非循环模式下元素起始位从0开始
            ctx[translateStartDir] = -itemWH * ctx.index;

            ctx.on("move", () => {

               let move = ctx["move" + dir];

               // 右端滑动
               if (move > 0 && ctx.index === 0) {
                  move = move / ctx.damping;
               }

               // 左端滑动
               else if (move < 0 && ctx.index === childElementCount - 1) {
                  move = move / ctx.damping;
               }

               const translateStart = ctx[translateStartDir];
               ctx[translateDir] = (translateStart + move);

               style.transform = `translate3d(${ctx.translateX}px, ${ctx.translateY}px, 0px)`;

            })

            function pageTurning() {

               const move = ctx["move" + dir];
               const translateStart = ctx[translateStartDir];
               const translate = translateStart + move;

               const itemsWH = -(itemWH * ctx.index);
               const halfWH = itemWH / 5;

               if (translate > itemsWH + halfWH) {
                  if (ctx.index > 0) {
                     ctx.index--;
                     ctx[translateEndDir] = itemsWH + itemWH;
                  } else {
                     ctx[translateEndDir] = itemsWH;
                  }
               } else if (translate < itemsWH - halfWH) {
                  if (ctx.index < childElementCount - 1) {
                     ctx.index++;
                     ctx[translateEndDir] = itemsWH - itemWH;
                  } else {
                     ctx[translateEndDir] = itemsWH;
                  }
               } else {
                  ctx[translateEndDir] = itemsWH;
               }

               style.transform = `translate3d(${ctx.translateEndX}px, ${ctx.translateEndY}px, 0px)`;
               style.transitionDuration = `${transitionDuration}ms`;

            }

            ctx.on("prev", pageTurning); // 事件结束后自动对齐

            ctx.on("next", pageTurning);

         }

         // 设置容器的起始坐标
         style.transform = `translate3d(${ctx.translateStartX}px, ${ctx.translateStartY}px, 0px)`;
         style.transitionDuration = '0ms';

         // 设置translateEnd初始值
         ctx['translateEnd' + dir] = -(itemWH * ctx.index);

         // 容器宽或高值
         ctx.containerWH = itemWH * childElementCount;

         ctx.on('start', ev => {

            style.transitionDuration = "0ms";

         })

      }
   }

}