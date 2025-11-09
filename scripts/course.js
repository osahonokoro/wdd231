document.addEventListener("DOMContentLoaded", () => {
    const allBtn = document.getElementById("allBtn");
    const wddBtn = document.getElementById("wddBtn");
    const cseBtn = document.getElementById("cseBtn");
    const cards = document.querySelectorAll(".course-card");

    allBtn.addEventListener("click", () => {
        cards.forEach(card => card.style.display = "block");
    });

    wddBtn.addEventListener("click", () => {
        cards.forEach(card => {
            card.classList.contains("wdd")
                ? card.style.display = "block"
                : card.style.display = "none";
        });
    });

    cseBtn.addEventListener("click", () => {
        cards.forEach(card => {
            card.classList.contains("cse")
                ? card.style.display = "block"
                : card.style.display = "none";
        });
    });
});
