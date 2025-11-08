document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.querySelector("#menu-button");
    const nav = document.querySelector("nav");

    menuBtn.addEventListener("click", () => {
        nav.classList.toggle("show");
    });
});
