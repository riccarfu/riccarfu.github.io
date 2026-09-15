const peopleContainer = document.getElementById("people-container");
const addPersonButton = document.getElementById("addPerson");
const calculateButton = document.getElementById("calculate");
const results = document.getElementById("results");

let personCount = 2;


// ==================================================
// ADD PERSON
// ==================================================

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


// ==================================================
// CALCULATE
// ==================================================

calculateButton.addEventListener("click", () => {

    results.innerHTML = "";

    const inputs = [
        ...document.querySelectorAll(".dob")
    ];

    const birthdays = inputs.map(input => {

        if (!input.value) {
            return null;
        }

        return parseDate(input.value);
    });


    // Make sure every person has a DOB

    if (birthdays.some(date => date === null)) {

        results.innerHTML = `
            <p class="error">
                Please enter a date of birth for every person.
            </p>
        `;

        return;
    }


    if (birthdays.length < 2) {

        results.innerHTML = `
            <p class="error">
                Please enter at least two people.
            </p>
        `;

        return;
    }


    // Calculate every unique pair

    for (let i = 0; i < birthdays.length; i++) {

        for (let j = i + 1; j < birthdays.length; j++) {

            const matches = findMatches(
                birthdays[i],
                birthdays[j]
            );

            displayResult(
                i + 1,
                j + 1,
                matches
            );
        }
    }
});


// ==================================================
// PARSE DATE
// ==================================================
//
// Do NOT use:
//
// new Date("2000-01-15")
//
// because timezone conversion can cause problems.
//
// ==================================================

function parseDate(value) {

    const parts = value.split("-");

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    return new Date(
        year,
        month - 1,
        day
    );
}


// ==================================================
// FORMAT DATE
// ==================================================

function formatDate(date) {

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}


// ==================================================
// GET DATE WHEN PERSON TURNS A GIVEN AGE
// ==================================================

function birthdayAtAge(dob, age) {

    return new Date(
        dob.getFullYear() + age,
        dob.getMonth(),
        dob.getDate()
    );
}


// ==================================================
// REVERSE AGE
// ==================================================

function reverseAge(age) {

    return Number(
        String(age)
            .split("")
            .reverse()
            .join("")
    );
}


// ==================================================
// CHECK IF TWO DATES ARE THE SAME DAY
// ==================================================

function sameDate(a, b) {

    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}


// ==================================================
// GET TODAY WITHOUT TIME
// ==================================================

function today() {

    const date = new Date();

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}


// ==================================================
// FIND PALINDROME AGE DATES
// ==================================================

function findMatches(dob1, dob2) {

    const now = today();

    const matches = [];

    /*
        Test every possible age.

        Example:

        age1 = 15
        reverseAge(15) = 51

        Therefore we ask:

        When does person 1 turn 15?
        When does person 2 turn 51?

        If those dates are identical,
        we have a palindrome-age date.
    */

    const MAX_AGE = 200;

    for (let age1 = 0; age1 <= MAX_AGE; age1++) {

        const age2 = reverseAge(age1);

        // Don't allow impossible ages.
        if (age2 > MAX_AGE) {
            continue;
        }


        const date1 = birthdayAtAge(
            dob1,
            age1
        );

        const date2 = birthdayAtAge(
            dob2,
            age2
        );


        // Both people must reach their ages
        // on exactly the same date.

        if (sameDate(date1, date2)) {

            matches.push({
                date: date1,
                age1: age1,
                age2: age2
            });
        }
    }


    // Sort chronologically

    matches.sort(
        (a, b) => a.date - b.date
    );


    // Remove duplicate dates

    const uniqueMatches = [];

    for (const match of matches) {

        const alreadyExists = uniqueMatches.some(
            existing => sameDate(
                existing.date,
                match.date
            )
        );

        if (!alreadyExists) {
            uniqueMatches.push(match);
        }
    }


    // Previous

    let previous = null;

    for (const match of uniqueMatches) {

        if (match.date < now) {
            previous = match;
        }
    }


    // Future dates

    const future = uniqueMatches.filter(
        match => match.date >= now
    );


    return {
        previous: previous,
        next: future[0] || null,
        next2: future[1] || null
    };
}


// ==================================================
// DISPLAY RESULTS
// ==================================================

function displayResult(
    person1,
    person2,
    matches
) {

    const result = document.createElement("div");

    result.className = "result";

    result.innerHTML = `
        <div class="pair-title">
            Person ${person1} ↔ Person ${person2}
        </div>

        ${createRow(
            "Previous",
            matches.previous
        )}

        ${createRow(
            "Next",
            matches.next
        )}

        ${createRow(
            "Next after",
            matches.next2
        )}
    `;

    results.appendChild(result);
}


// ==================================================
// CREATE RESULT ROW
// ==================================================

function createRow(label, match) {

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

            <span>
                ${label}
            </span>

            <span>

                <span class="date">
                    ${formatDate(match.date)}
                </span>

                <span class="ages">
                    ${match.age1} ↔ ${match.age2}
                </span>

            </span>

        </div>
    `;
}