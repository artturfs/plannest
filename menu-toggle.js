document.addEventListener("DOMContentLoaded", function() { 
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.getElementById("nav-links");

    menuToggle.addEventListener("click", function() {
        navLinks.classList.toggle("active");
    });
});