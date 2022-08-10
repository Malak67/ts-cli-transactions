#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionFile = void 0;
const fs = require("fs");
const Path = require("path");
const types_1 = require("./types");
/**
 *  return the arguments of the command except node and index.ts
 */
const getArgs = () => {
    // We retrieve all the command arguments except the first 2
    const args = process.argv.slice(2);
    return args;
};
const getTransactionFile = (fileName) => {
    const packageJSONPath = Path.resolve(__dirname, `../${fileName}`);
    const content = fs.readFileSync(packageJSONPath, { encoding: 'utf8' });
    const transactions = JSON.parse(content);
    const formattedTransaction = reduceTransactionsPerUserId(transactions);
    printFormattedTransactions(formattedTransaction);
};
exports.getTransactionFile = getTransactionFile;
const printFormattedTransactions = (values) => {
    var _a, _b, _c;
    console.log('PRINTING FORMATTED TRANSACTIONS');
    let output = `
    User ID                                  GBP        USD        EUR        Last Activity\n
  `;
    for (const [key, value] of Object.entries(values)) {
        output += `
    ${key}     ${sum((_a = value[types_1.CurrencyType.GBP]) === null || _a === void 0 ? void 0 : _a.values) || '-'}           ${sum((_b = value[types_1.CurrencyType.USD]) === null || _b === void 0 ? void 0 : _b.values) || '-'}             ${sum((_c = value[types_1.CurrencyType.EUR]) === null || _c === void 0 ? void 0 : _c.values) || '-'}               ${getLatestDate([])}\n
    `;
        console.log(`Value: ${JSON.stringify(value)}`);
    }
    console.log(output);
};
const reduceTransactionsPerUserId = (transactions) => {
    const userTransactions = transactions.reduce((previousValue, currentValue) => {
        if (previousValue[currentValue.user_id]) {
            if (previousValue[currentValue.user_id][currentValue.currency]) {
                previousValue[currentValue.user_id][currentValue.currency].values.push(Number(currentValue.amount));
                previousValue[currentValue.user_id][currentValue.currency].timestamps.push(currentValue.timestamp);
            }
            else {
                previousValue[currentValue.user_id] = Object.assign(Object.assign({}, previousValue[currentValue.user_id]), { [currentValue.currency]: {
                        type: currentValue.currency,
                        values: [Number(currentValue.amount)],
                        timestamps: [currentValue.timestamp],
                    } });
            }
        }
        else {
            Object.assign(previousValue, {
                [currentValue.user_id]: {
                    [currentValue.currency]: {
                        type: currentValue.currency,
                        values: [Number(currentValue.amount)],
                        timestamps: [currentValue.timestamp],
                    },
                },
            });
        }
        return previousValue;
    }, []);
    return userTransactions;
};
const getLatestDate = (dates) => {
    if (!dates || dates.length === 0) {
        return;
    }
    return dates.reduce((a, b) => (a > b ? a : b));
};
const sum = (array) => {
    if (!array || array.length === 0) {
        return;
    }
    const total = array.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    return (total <= 0 ? '' : '+') + (total === null || total === void 0 ? void 0 : total.toFixed(2).toString());
};
/**
 * Command Help
 */
const printCommandHelp = () => {
    const help = `

  A simple command which reads transactions from a JSON file

Example:

$ sprint-read transactions.json

`;
    console.log(help);
};
const symbols = getArgs();
// Print help if no arguments
if (symbols.length === 0) {
    printCommandHelp();
    process.exit(0);
}
const now = new Date().toISOString();
symbols.forEach((symbol) => {
    console.log(`Retrieving stock information for ${symbol} at date ${now}`);
    (0, exports.getTransactionFile)(symbol);
});
//# sourceMappingURL=working.js.map