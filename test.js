window.addEventListener("load", function () {
   
   lightTouch('.x').swipeX()
   lightTouch('.y').swipeY()

   // function (ev, options) {
   //    // console.log(options.clientX);
   //    // console.log(ev.target, options.clientX + "px")
   //    // console.log("X")
   //    ev.target.setAttribute("style", "transform: translate(" + Math.round(options.clientX) + "px, 0px) translateZ(0px)");
   // }

   // .swipeY(function (options) {
   //    // let { y } = options;
   //    console.log(options);
   // })
   // .drag(function (options) {
   //    console.log(options);
   // })

}, false);

