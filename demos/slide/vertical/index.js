import TouchBox from '../../../src/index.js';
import swipe from '../../../src/swipe/index.js';
import navigation from '../../../src/swipe/navigation.js';
import pagination from '../../../src/swipe/pagination.js';
// import autoplay from '../../../src/swipe/autoplay.js';

window.addEventListener("load", function () {

   const touchBox = new TouchBox('.slide-box', { "direction": "vertical" });

   touchBox.use(swipe({
      loop: false,
      position: 1,
      transitionDuration: 300,
   }));

   // touchBox.use(autoplay({
   //    delay: 2500,
   //    disableOnInteraction: false,
   // }));

   touchBox.use(navigation({
      next: '.slide-button-next',
      prev: '.slide-button-prev',
      disable: 'slide-button-disable'
   }));

   touchBox.use(pagination({ el: '.slide-pagination' }));

}, false)