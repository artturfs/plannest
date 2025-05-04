document.addEventListener("DOMContentLoaded", function() { 
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.getElementById("nav-links");

    menuToggle.addEventListener("click", function() {
        navLinks.classList.toggle("active");
    });
    document.addEventListener("click", function(event) {
        if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
            navLinks.classList.remove("active");
        }
    });

    navLinks.addEventListener("click", function(event) {
        if (event.target.tagName === "A") {
            navLinks.classList.remove("active");
        }
    });
});
