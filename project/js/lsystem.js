const lSystemLanguage = ['F', '+', '-'];
Object.freeze(lSystemLanguage);

/**
 * Helper method for branching
 * @param min
 * @param max
 * @returns {number}
 */
function randomNumberBetweenRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Helper method to split array into array with nested arrays of length N
 * @param n
 * @param data
 * @returns {*[]}
 */
function groupArrayInSetsOfN(n, data)  {
    let result = [];
    for (let i = 0; i < data.length; i += n)
        result.push(data.slice(i, i + n));

    if (result[result.length - 1].length !== n)
        result.pop();

    return result;
}

/**
 * L-system builder
 *
 * @param stringLength
 * @param branchStartIndex
 * @returns {*[]}
 */
function generateRandomisedLSystemString(stringLength, branchStartIndex) {
    const ruleArray = [];
    let tempLang = [];

    for (let i = 0; i < stringLength; i++) {
        let ruleInput, tempLangIndex;
        if (i < branchStartIndex) {
            ruleInput = "F";
        } else if (ruleArray[i - 1] !== "F" && ruleArray[i - 2] !== "F") {
            ruleInput = "F";
        } else {
            if (ruleArray[i - 1] === "+" || ruleArray[i - 2] === "+") {
                tempLang = ["F", "-"];
            } else if (ruleArray[i - 1] === "-" || ruleArray[i - 2] === "-") {
                tempLang = ["F", "+"];
            } else {
                tempLang = lSystemLanguage;
            }
            tempLangIndex = Math.floor(Math.random() * tempLang.length);
            ruleInput = tempLang[tempLangIndex]
        }
        ruleArray.push(ruleInput)
    }
    return ruleArray;
}

/**
 * Generic L-system builder from an axiom and a set of rules
 * Requires an axiom string, built from F, +  and -
 * Requires a rules object to substitute F into a production rule, along with + and -
 * @param start
 * @param rules
 * @returns {string}
 */
function generateLSystem(start, rules) {
    let lSystem = "";
    for (let c in start) {
        if (start[c] === rules.axi) {
            lSystem += $("#production").val();
        } else if (start[c] === rules.plus) {
            lSystem += rules.plus;
        } else if (start[c] === rules.minus) {
            lSystem += rules.minus;
        }
    }
    return lSystem;
}
