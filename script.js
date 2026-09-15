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
        <label>Person ${personCount}</label>
        <input type="date" class="dob">
    `;

    peopleContainer.appendChild(div);
});

calculateBtn.addEventListener("click", runCalculation);

function runCalculation() {
    const birthDates = [...document.querySelectorAll(".dob")]
        .map(x => x.value)
        .filter(Boolean)
        .map(x => new Date(x));

    resultsDiv.innerHTML = "";

    if (birthDates.length < 2) {
        resultsDiv.innerHTML =
            "<p>Please enter at least two birth dates.</p>";
        return;
    }

    for (let i = 0; i < birthDates.length; i++) {
        for (let j = i + 1; j < birthDates.length; j++) {

            const matches = findPalindromeMatches(
                birthDates[i],
                birthDates[j]
            );

            const card = document.createElement("div");
            card.className = "result";

            card.innerHTML = `
                <div class="pair-title">
                    Person ${i + 1} ↔ Person ${j + 1}
                </div>

                <div>
                    <strong>Previous:</strong>
                    ${formatMatch(matches.previous)}
                </div>

                <div>
                    <strong>Next:</strong>
                    ${formatMatch(matches.next)}
                </div>

                <div>
                    <strong>Next After:</strong>
                    ${formatMatch(matches.next2)}
                </div>
            `;

            resultsDiv.appendChild(card);
        }
    }
}

function formatMatch(match) {
    if (!match) return "None";

    return `${formatDate(match.date)}
            (${match.age1} ↔ ${match.age2})`;
}

function formatDate(date) {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();

    return `${d}/${m}/${y}`;
}

function reverseAge(age) {
    return Number(String(age).split("").reverse().join(""));
}

function sameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function addYears(date, years) {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
}

function findPalindromeMatches(dob1, dob2) {

    const today = new Date();

    const matches = [];

    const MAX_AGE = 1500;

    for (let age1 = 0; age1 <= MAX_AGE; age1++) {

        const age2 = reverseAge(age1);

        if (age2 > MAX_AGE) continue;

        const date1 = addYears(dob1, age1);
        const date2 = addYears(dob2, age2);

        if (sameDay(date1, date2)) {
            matches.push({
                date: date1,
                age1,
                age2
            });
        }
    }

    matches.sort((a, b) => a.date - b.date);

    const past = matches.filter(x => x.date < today);
    const future = matches.filter(x => x.date >= today);

    return {
        previous: past.length
            ? past[past.length - 1]
            : null,

        next: future.length
            ? future[0]
            : null,

        next2: future.length > 1
            ? future[1]
            : null
    };
}