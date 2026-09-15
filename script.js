const peopleContainer = document.getElementById("people-container");
const addPersonBtn = document.getElementById("addPerson");
const calculateBtn = document.getElementById("calculate");
const resultsDiv = document.getElementById("results");

let personCount = 2;

addPersonBtn.addEventListener("click", () => {
    personCount++;

    const row = document.createElement("div");
    row.className = "person";

    row.innerHTML = `
        <label>Person ${personCount}</label>
        <input type="date" class="dob">
    `;

    peopleContainer.appendChild(row);
});

calculateBtn.addEventListener("click", () => {
    const birthDates = [...document.querySelectorAll(".dob")]
        .map(input => input.value)
        .filter(Boolean)
        .map(value => new Date(value));

    resultsDiv.innerHTML = "";

    if (birthDates.length < 2) {
        resultsDiv.innerHTML = "<p>Please enter at least two birth dates.</p>";
        return;
    }

    for (let i = 0; i < birthDates.length; i++) {
        for (let j = i + 1; j < birthDates.length; j++) {

            const match = findNextPalindromeAgeDate(
                birthDates[i],
                birthDates[j]
            );

            const card = document.createElement("div");
            card.className = "result";

            if (match) {
                card.innerHTML = `
                    <div class="pair-title">
                        Person ${i + 1} ↔ Person ${j + 1}
                    </div>

                    <div>
                        Next palindrome-age date:
                        <strong>${match.date}</strong>
                    </div>

                    <div>
                        Ages:
                        <strong>${match.age1}</strong>
                        ↔
                        <strong>${match.age2}</strong>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="pair-title">
                        Person ${i + 1} ↔ Person ${j + 1}
                    </div>

                    <div>No palindrome-age date found.</div>
                `;
            }

            resultsDiv.appendChild(card);
        }
    }
});

function getAgeOnDate(dob, date) {
    let age = date.getFullYear() - dob.getFullYear();

    const birthdayPassed =
        date.getMonth() > dob.getMonth() ||
        (
            date.getMonth() === dob.getMonth() &&
            date.getDate() >= dob.getDate()
        );

    if (!birthdayPassed) {
        age--;
    }

    return age;
}

function reverseNumber(num) {
    return Number(
        String(num)
            .split("")
            .reverse()
            .join("")
    );
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function findNextPalindromeAgeDate(dob1, dob2) {
    const startDate = new Date();

    // Search up to 200 years ahead
    const maxDays = 200 * 365;

    for (let offset = 0; offset < maxDays; offset++) {
        const current = new Date(startDate);
        current.setDate(startDate.getDate() + offset);

        const age1 = getAgeOnDate(dob1, current);
        const age2 = getAgeOnDate(dob2, current);

        if (
            age1 >= 0 &&
            age2 >= 0 &&
            reverseNumber(age1) === age2
        ) {
            return {
                date: formatDate(current),
                age1,
                age2
            };
        }
    }

    return null;
}