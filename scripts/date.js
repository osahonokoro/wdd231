document.addEventListener("DOMContentLoaded", () => {
    const dateElement = document.querySelector("#current-date");

    const today = new Date();
    const formattedDate = today.toDateString();

    if (dateElement) {
        dateElement.textContent = formattedDate;
    }
});
