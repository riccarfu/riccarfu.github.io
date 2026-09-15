const peopleContainer = document.getElementById("people-container");
const addPersonButton = document.getElementById("addPerson");
const calculateButton = document.getElementById("calculate");
const results = document.getElementById("results");

let personCount = 2;


// ============================================================
// ADD PERSON
// ============================================================

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


// ============================================================
// CALCULATE
// ============================================================

calculateButton.addEventListener("click", () => {

    results.innerHTML = "";

    const inputs = [...document.querySelectorAll(".dob")];

    if (inputs.length < 2) {
        showError("Please enter at least two people.");
        return;
    }

    const birthdays = inputs.map(input => {

        if (!input.value) {
            return null;
        }

        return parseDate(input.value);
    });

    if (birthdays.some(date => date === null)) {
        showError("Please enter a date of birth for every person.");
        return;
    }

    // Every unique pair of people.
    for (let i = 0; i < birthdays.length; i++) {

        for (let j = i + 1; j < birthdays.length; j++) {

            const matches = findPalindromePeriods(
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


// ============================================================
// PARSE DATE
// ============================================================

function parseDate(value) {

    const [year, month, day] = value
        .split("-")
        .map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
}


// ============================================================
// FORMAT DATE
// ============================================================

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


// ============================================================
// DATE COMPARISON
// ============================================================

function compareDates(a, b) {
    return a.getTime() - b.getTime();
}


function sameDate(a, b) {
    return compareDates(a, b) === 0;
}


// ============================================================
// GET TODAY
// ============================================================

function getToday() {

    const now = new Date();

    return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );
}


// ============================================================
// ADD YEARS TO A DOB
//
// Handles February 29 correctly:
// A Feb 29 birthday is treated as Feb 28 in non-leap years.
//
// ============================================================

function birthdayAtAge(dob, age) {

    const year = dob.getFullYear() + age;
    const month = dob.getMonth();
    const day = dob.getDate();

    // February 29
    if (
        month === 1 &&
        day === 29 &&
        !isLeapYear(year)
    ) {
        return new Date(year, 1, 28);
    }

    return new Date(year, month, day);
}


function isLeapYear(year) {

    return (
        year % 4 === 0 &&
        (
            year % 100 !== 0 ||
            year % 400 === 0
        )
    );
}


// ============================================================
// REVERSE AGE
//
// IMPORTANT:
//
// 15 -> 51       valid
// 24 -> 42       valid
// 101 -> 101     valid
// 10 -> 01       INVALID
// 20 -> 02       INVALID
//
// We don't treat "01" or "02" as ages.
// ============================================================

function reverseAge(age) {

    const text = String(age);

    // A number ending in zero would produce
    // a leading zero when reversed.
    if (text.endsWith("0")) {
        return null;
    }

    const reversed = text
        .split("")
        .reverse()
        .join("");

    return Number(reversed);
}


// ============================================================
// AGE PERIOD
//
// If someone turns 15 on 10/05/2030:
//
// Age 15 starts:
//     10/05/2030
//
// Age 15 ends:
//     09/05/2031
//
// ============================================================

function getAgePeriod(dob, age) {

    const start = birthdayAtAge(dob, age);

    const end = birthdayAtAge(dob, age + 1);

    end.setDate(end.getDate() - 1);

    return {
        start,
        end
    };
}


// ============================================================
// FIND OVERLAP BETWEEN TWO AGE PERIODS
// ============================================================

function getOverlap(period1, period2) {

    const start =
        compareDates(period1.start, period2.start) >= 0
            ? period1.start
            : period2.start;

    const end =
        compareDates(period1.end, period2.end) <= 0
            ? period1.end
            : period2.end;

    if (compareDates(start, end) > 0) {
        return null;
    }

    return {
        start,
        end
    };
}


// ============================================================
// FIND ALL PALINDROME-AGE PERIODS
// ============================================================

function findPalindromePeriods(dob1, dob2) {

    const MAX_AGE = 150;

    const periods = [];

    /*
        We test each possible age for Person 1.

        Example:

            Person 1 = 15
            Person 2 = 51

        We calculate the complete period in which
        Person 1 is 15 and Person 2 is 51.

        If those periods overlap, the overlap is
        a palindrome-age period.
    */

    for (let age1 = 0; age1 <= MAX_AGE; age1++) {

        const age2 = reverseAge(age1);

        // Not a valid reversed age.
        if (age2 === null) {
            continue;
        }

        // Don't allow ages beyond our search range.
        if (age2 > MAX_AGE) {
            continue;
        }

        const period1 = getAgePeriod(
            dob1,
            age1
        );

        const period2 = getAgePeriod(
            dob2,
            age2
        );

        const overlap = getOverlap(
            period1,
            period2
        );

        if (!overlap) {
            continue;
        }

        periods.push({
            start: overlap.start,
            end: overlap.end,
            age1: age1,
            age2: age2
        });
    }


    // Sort chronologically.

    periods.sort(
        (a, b) => compareDates(a.start, b.start)
    );


    // Remove duplicate periods.

    const uniquePeriods = [];

    for (const period of periods) {

        const duplicate = uniquePeriods.some(existing => {

            return (
                sameDate(existing.start, period.start) &&
                sameDate(existing.end, period.end)
            );
        });

        if (!duplicate) {
            uniquePeriods.push(period);
        }
    }


    return getPreviousAndFuture(
        uniquePeriods
    );
}


// ============================================================
// GET PREVIOUS + NEXT TWO
// ============================================================

function getPreviousAndFuture(periods) {

    const today = getToday();

    let previous = null;

    const future = [];

    for (const period of periods) {

        /*
            A period is "previous" if it has already ended.

            This is important.

            If today is currently inside a palindrome-age
            period, that current period is NOT considered
            "Previous".
        */

        if (
            compareDates(period.end, today) < 0
        ) {
            previous = period;
        }


        /*
            A future period starts after today.

            If a palindrome period is happening today,
            it is not returned as "Next".
        */

        if (
            compareDates(period.start, today) > 0
        ) {
            future.push(period);
        }
    }


    return {
        previous: previous,
        next: future[0] || null,
        next2: future[1] || null
    };
}


// ============================================================
// DISPLAY
// ============================================================

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


// ============================================================
// RESULT ROW
// ============================================================

function createRow(label, period) {

    if (!period) {

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
                    ${formatDate(period.start)}
                </span>

                <span class="ages">
                    ${period.age1} ↔ ${period.age2}
                </span>

                <span class="period">
                    through ${formatDate(period.end)}
                </span>

            </span>

        </div>
    `;
}


// ============================================================
// ERROR
// ============================================================

function showError(message) {

    results.innerHTML = `
        <p class="error">${message}</p>
    `;
}