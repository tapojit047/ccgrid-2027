let currentSlide = 0;
  const slides = document.querySelectorAll('.slideshow .slide');

  function showSlide(index) {
    slides.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
  }

  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 5000); // change slide every 5 seconds

  // Countdown Timer
  const countdownDate = new Date("May 17, 2027 09:00:00").getTime();
  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    if (distance < 0) return;

    document.getElementById("days").textContent = Math.floor(distance / (1000 * 60 * 60 * 24));
    document.getElementById("hours").textContent = Math.floor((distance / (1000 * 60 * 60)) % 24);
    document.getElementById("minutes").textContent = Math.floor((distance / (1000 * 60)) % 60);
    document.getElementById("seconds").textContent = Math.floor((distance / 1000) % 60);
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);