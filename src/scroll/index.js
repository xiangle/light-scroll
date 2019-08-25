const defaults = {
   distance: 5,
   damping: 5,
}

export default function scroll(options = {}) {

   return function (ctx) {

      Object.assign(options, defaults);

      const autoPlay = () => {
         ctx.timeID = setTimeout(() => {
            if (ctx.current < ctx.amount) {
               const X = ++ctx.current * ctx.clientWidth;
               ctx.el.style.transitionDuration = "450ms";
               ctx.el.style.transitionTimingFunction = "ease";
               ctx.el.style.transform = `translateX(${-X}px)`;
               ctx.carousel();
            }
         }, options.autoPlay);
      }

      const scrollX = () => {
         ctx.translateX = ctx.translateStartX + ctx.moveX;
         ctx.el.style.transform = `translateX(${ctx.translateX}px)`;
         options.move && options.move.call(ctx);
      }

      ctx.el.style.transform = `translateX(0px)`;

      ctx.touchstart.push(() => {
         const { transform } = getComputedStyle(ctx.el, null);
         ctx.translateStartX = Number(transform.split(", ")[4]);
      });

      ctx.gesture.push(() => {
         if (ctx.moveY) {
            if (Math.abs(ctx.moveX / ctx.moveY) > 4) {
               ctx.touchmove.push(scrollX)
            }
         } else {
            ctx.touchmove.push(scrollX)
         }
      });

      ctx.touchend.push(() => {
         options.autoPlay && autoPlay();
      });

      return ctx;

   }

}