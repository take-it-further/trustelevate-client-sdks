// Deprecated, rely on the response from the back end: ConsentReceipt.age_bands.

// A regular expression to match the age band format
const ageBandPattern = /^(\d{1,2})([+-])(\d{0,2})$/;

// An error to throw when the age band is invalid
const ageBandError = new Error("invalid age band, accepted formats: 7-, 7-16, 16+");

// A function to validate the age band and return the minimum and maximum age
export function validateAgeBand(ageBand: string): [number, number] {
    // Check if the age band matches the pattern
    const match = ageBandPattern.test(ageBand);
    if (!match) {
        throw ageBandError;
    }

    // Extract the first age, the sign, and the second age from the age band
    const matches = ageBandPattern.exec(ageBand)!;
    const firstAge = parseInt(matches[1]);
    const sign = matches[2];
    let secondAge = Number.MAX_SAFE_INTEGER;
    const secondAgeFound = matches[3].length > 0;
    if (secondAgeFound) {
        secondAge = parseInt(matches[3]);
    }

    // Check if the sign and the second age are valid
    if (sign === "+" && secondAgeFound) {
        throw ageBandError;
    }
    // Check if the first age is less than the second age
    if (firstAge >= secondAge) {
        throw ageBandError;
    }

    // Return the minimum and maximum age based on the sign
    if (sign === "+") {
        return [firstAge, Number.MAX_SAFE_INTEGER];
    } else {
        if (secondAgeFound) {
            return [firstAge, secondAge];
        } else {
            return [0, firstAge];
        }
    }
}