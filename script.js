const peopleContainer = document.getElementById("people-container");
const addPersonButton = document.getElementById("addPerson");
const calculateButton = document.getElementById("calculate");
const results = document.getElementById("results");

let personCount = 2;


// --------------------------------------------------
// Add another person
// --------------------------------------------------

addPersonButton.addEventListener("click", () => {
    personCount++;

    const person = document.createElement("div");
    person.className = "person";

    person.innerHTML = `
        <label>Person ${personCount}</label>
        <input type="date" class="dob">
    `;

    peopleContainer.appendChild(person);
});


// --------------------------------------------------
// Calculate
// --------------------------------------------------

calculateButton.addEventListener("click", () => {

    const inputs = [...document.querySelectorAll(".dob")];

    const birthdays = inputs
        .map(input => parseDate(input.value))
        .filter(date => date !== null);

    results.innerHTML = "";

    if (birthdays.length < 2) {
        results.innerHTML = `
            <p>Please enter at least two dates of birth.</p>
        `;
        return;
    }

    for (let i = 0; i < birthdays.length; i++) {

        for (let j = i + 1; j < birthdays.length; j++) {

            const matches = findPalindromeDates(
                birthdays[i],
                birthdays[j]
            );

            displayResult(i + 1, j + 1, matches);
        }
    }
});


// --------------------------------------------------
// Parse YYYY-MM-DD without timezone problems
// --------------------------------------------------

function parseDate(value) {

    if (!value) {
        return null;
    }

    const [year, month, day] = value.split("-").map(Number);

    return new Date(year, month - 1, day);
}


// --------------------------------------------------
// Format DD/MM/YYYY
// --------------------------------------------------

function formatDate(date) {

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}


// --------------------------------------------------
// Get a person's age on a particular date
// --------------------------------------------------

function getAge(dob, date) {

    let age = date.getFullYear() - dob.getFullYear();

    const birthdayThisYear = new Date(
        date.getFullYear(),
        dob.getMonth(),
        dob.getDate()
    );

    if (date < birthdayThisYear) {
        age--;
    }

    return age;
}


// --------------------------------------------------
// Get the date someone turns a particular age
// --------------------------------------------------

function dateAtAge(dob, age) {

    return new Date(
        dob.getFullYear() + age,
        dob.getMonth(),
        dob.getDate()
    );
}


// --------------------------------------------------
// Reverse an age
//
// 15 -> 51
// 24 -> 42
// 103 -> 301
// 7 -> 7
//
// 04 is NOT treated as an age.
// --------------------------------------------------

function reverseAge(age) {

    return Number(
        String(age)
            .split("")
            .reverse()
            .join("")
    );
}


// --------------------------------------------------
// Compare dates by calendar day
// --------------------------------------------------

function sameDate(a, b) {

    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}


// --------------------------------------------------
// Find all palindrome-age dates
// --------------------------------------------------

function findPalindromeDates(dob1, dob2) {

    const today = new Date();

    // Remove the time component.
    today.setHours(0, 0, 0, 0);

    const matches = [];

    /*
        We only need to test ages that could realistically
        occur during the lifetimes of the two people.

        0-150 is more than enough for normal use.
    */

    const MAX_AGE = 150;

    for (let age1 = 0; age1 <= MAX_AGE; age1++) {

        const age2 = reverseAge(age1);

        // Ignore impossible age combinations.
        if (age2 > MAX_AGE) {
            continue;
        }

        const date1 = dateAtAge(dob1, age1);
        const date2 = dateAtAge(dob2, age2);

        /*
            Both people must reach their respective ages
            on exactly the same calendar date.
        */

        if (sameDate(date1, date2)) {

            matches.push({
                date: date1,
                age1: age1,
                age2: age2
            });
        }
    }

    // Sort chronologically.
    matches.sort((a, b) => a.date - b.date);


    // --------------------------------------------------
    // Separate past and future
    // --------------------------------------------------

    const past = matches.filter(match => match.date < today);

    const future = matches.filter(match => match.date >= today);


    return {
        previous: past.length > 0
            ? past[past.length - 1]
            : null,

        next: future.length > 0
            ? future[0]
            : null,

        next2: future.length > 1
            ? future[1]
            : null
    };
}


// --------------------------------------------------
// Display result
// --------------------------------------------------

function displayResult(person1, person2, matches) {

    const result = document.createElement("div");

    result.className = "result";

    result.innerHTML = `
        <div class="pair-title">
            Person ${person1} ↔ Person ${person2}
        </div>

        ${createDateRow(
            "Previous",
            matches.previous
        )}

        ${createDateRow(
            "Next",
            matches.next
        )}

        ${createDateRow(
            "Next after",
            matches.next2
        )}
    `;

    results.appendChild(result);
}


// --------------------------------------------------
// Create one result row
// --------------------------------------------------

function createDateRow(label, match) {

    if (!match) {

        return `
            <div class="date-row">
                <span>${label}</span>
                <span>None found</span>
            </div>
        `;
    }

    return `
        <div class="date-row">
            <span>${label}</span>

            <span>
                <span class="date">
                    ${formatDate(match.date)}
                </span>

                <span class="ages">
                    (${match.age1} ↔ ${match.age2})
                </span>
            </span>
        </div>
    `;
}