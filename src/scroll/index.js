const defaults = {
   distance: 5,
   damping: 5,
}

export default function scroll(options = {}) {

   return function (ctx) {

      Object.assign(options, defaults);

      // const autoPlay = () => {
      //    ctx.timeID = setTimeout(() => {
      //       if (ctx.current < ctx.amount) {
      //          const X = ++ctx.current * ctx.clientWidth;
      //          ctx.box.style.transitionDuration = "450ms";
      //          ctx.box.style.transitionTimingFunction = "ease";
      //          ctx.box.style.transform = `translateX(${-X}px)`;
      //          ctx.carousel();
      //       }
      //    }, options.autoPlay);
      // }

      const scrollX = () => {
         ctx.translateX = ctx.translateStartX + ctx.moveX;
         ctx.box.style.transform = `translateX(${ctx.translateX}px)`;
         options.move && options.move.call(ctx);
      }

      ctx.box.style.transform = `translateX(0px)`;

      ctx.on("start", () => {
         const { transform } = getComputedStyle(ctx.box, null);
         ctx.translateStartX = Number(transform.split(", ")[4]);
      });

      ctx.gesture.push(() => {
         if (ctx.moveY) {
            if (Math.abs(ctx.moveX / ctx.moveY) > 4) {
               ctx.on("move", scrollX);
            }
         } else {
            ctx.on("move", scrollX);
         }
      });

      return ctx;

   }

}