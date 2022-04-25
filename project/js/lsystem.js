const lsystemLanguageRegex = /^[F+\-\[\]]*$/;
const regexAB = /^[a-bA-B]*$/
const lSystemLanguage = ['F', '+', '-'];
const lSystemLanguageWithBrackets = ['F', '+', '-', '[', ']'];
Object.freeze(lSystemLanguage);
Object.freeze(lSystemLanguageWithBrackets);
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
 * Helper method to split array into Array with nested arrays of length N
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

function isInRange(number, min, max) {
    return number >= min && number <= max;
}

function getAllIndexes(arr, val) {
    let indexes = [], i;
    for (i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}

function generateFractalString(stringLength, branchStartIndex) {
    let ruleArray = [], tempLang = [];

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

function testRegex(ruleString1, ruleString2) {
    return regexAB.test(ruleString1) && regexAB.test(ruleString2) === true;
}

function testRuleCharacters(ruleChar1, ruleChar2) {
    return lsystemLanguageRegex.test(ruleChar1) && lsystemLanguageRegex.test(ruleChar2) === true;
}

function validateLineLength(lineLength) {
    return lineLength > 0;
}
