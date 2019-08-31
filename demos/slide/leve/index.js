import TouchBox from '../../../src/index.js';
import slide from '../../../src/slide/index.js';
import navigation from '../../../src/slide/navigation.js';
import pagination from '../../../src/slide/pagination.js';
// import autoplay from '../../../src/swipe/autoplay.js';

window.addEventListener("load", function () {

   const touchBox = new TouchBox('.slide-box', { "direction": "level" });

   touchBox.use(slide({
      loop: true,
      position: 2,
      transitionDuration: 300,
   }));

   // touchBox.use(autoplay({
   //    delay: 2500,
   //    disableOnInteraction: false,
   // }));

   touchBox.use(navigation({
      'next': '.slide-button-next',
      'prev': '.slide-button-prev',
      'disable': 'slide-button-disable'
   }));

   touchBox.use(pagination({ 'el': '.slide-pagination' }));

}, false);