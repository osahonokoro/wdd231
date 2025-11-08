document.addEventListener("DOMContentLoaded", () => {
    const courseContainer = document.querySelector("#course-container");

    const courses = [
        { name: "HTML Basics", level: "Beginner" },
        { name: "JavaScript Mastery", level: "Advanced" },
        { name: "CSS Design", level: "Intermediate" },
    ];

    courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "course-card";
        card.innerHTML = `<h3>${course.name}</h3><p>Level: ${course.level}</p>`;
        courseContainer.appendChild(card);
    });
});
