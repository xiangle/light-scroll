import TouchBox from '../src/index.js';
import swipe from '../src/swipe/index.js';
import navigation from '../src/swipe/navigation.js';
import pagination from '../src/swipe/pagination.js';

window.addEventListener("load", function () {

   const touchBox = new TouchBox('.slide-box');

   touchBox.use(swipe({
      direction: "level",
      loop: false,
      position: 3,
      autoplay: {
         delay: 2500,
         disableOnInteraction: false,
      },
      transitionDuration: 300,
   }));

   touchBox.use(navigation({
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
   }));

   touchBox.use(pagination({ el: '.swiper-pagination' }));

}, false)