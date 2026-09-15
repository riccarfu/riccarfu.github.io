const peopleContainer = document.getElementById("people-container");
const addPersonBtn = document.getElementById("addPerson");
const calculateBtn = document.getElementById("calculate");
const resultsDiv = document.getElementById("results");

let personCount = 2;

addPersonBtn.addEventListener("click", () => {
    personCount++;

    const div = document.createElement("div");
    div.className = "person";

    div.innerHTML = `
        <label>Person ${personCount}:</label>
        <input type="date" class="dob">
    `;

    peopleContainer.appendChild(div);
});

calculateBtn.addEventListener("click", () => {
    const dobInputs = document.querySelectorAll(".dob");

    const dates = Array.from(dobInputs)
        .map(input => input.value)
        .filter(value => value)
        .map(value => new Date(value));

    resultsDiv.innerHTML = "";

    if (dates.length < 2) {
        resultsDiv.innerHTML = "<p>Please enter at least two dates.</p>";
        return;
    }

    for (let i = 0; i < dates.length; i++) {
        for (let j = i + 1; j < dates.length; j++) {
            const diff = calculateDateDifference(dates[i], dates[j]);

            const result = document.createElement("div");
            result.className = "result-item";

            result.textContent =
                `Person ${i + 1} ↔ Person ${j + 1}: ` +
                `${diff.years} years, ${diff.months} months, ${diff.days} days`;

            resultsDiv.appendChild(result);
        }
    }
});

function calculateDateDifference(date1, date2) {
    let older = new Date(date1);
    let younger = new Date(date2);

    if (older > younger) {
        [older, younger] = [younger, older];
    }

    let years = younger.getFullYear() - older.getFullYear();
    let months = younger.getMonth() - older.getMonth();
    let days = younger.getDate() - older.getDate();

    if (days < 0) {
        months--;

        const previousMonth = new Date(
            younger.getFullYear(),
            younger.getMonth(),
            0
        );

        days += previousMonth.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months, days };
}