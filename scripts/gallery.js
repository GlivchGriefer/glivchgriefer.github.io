let slideIndex = 0;
let slides = document.getElementsByClassName("gallery-slide"); // Declare slides here

showSlides(slideIndex);

function changeSlide(n) {
  showSlides(slideIndex += n);
}

function showSlides(n) {
  let i;
  if (n >= slides.length) {slideIndex = 0}
  if (n < 0) {slideIndex = slides.length - 1}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";  
  }
  slides[slideIndex].style.display = "block";  
}

// Automatically change slides every 10 seconds
setInterval(function() {
  slideIndex++;
  if (slideIndex >= slides.length) { slideIndex = 0; }
  showSlides(slideIndex);
}, 10000); // 10000 milliseconds = 10 seconds
