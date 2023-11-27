document.addEventListener('DOMContentLoaded', function() {
    let touchstartX = 0;
    let touchendX = 0;
    
    const slider = document.querySelector('.gallery-slides');

    slider.addEventListener('touchstart', function(event) {
        touchstartX = event.changedTouches[0].screenX;
    }, false);

    slider.addEventListener('touchend', function(event) {
        touchendX = event.changedTouches[0].screenX;
        handleGesture();
    }, false); 

    function handleGesture() {
        if (touchendX < touchstartX) {
            changeSlide(1); // Swipe left, go to next slide
        }
        
        if (touchendX > touchstartX) {
            changeSlide(-1); // Swipe right, go to previous slide
        }
    }
});