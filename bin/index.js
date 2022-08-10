#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sum = exports.getLatestDate = exports.reduceTransactionsPerUserId = exports.printFormattedTransactions = exports.getTransactionFile = void 0;
const fs = require("fs");
const Path = require("path");
const types_1 = require("./types");
const FILE_MAX_SIZE = 0.01 * 1000 * 1024; // 5mb
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
    const { size } = fs.statSync(packageJSONPath);
    if (size >= FILE_MAX_SIZE) {
        console.log(`File is to big. It needs to be less than ${FILE_MAX_SIZE / (1000 * 1024)} Mb`);
        return;
    }
    const content = fs.readFileSync(packageJSONPath, { encoding: 'utf8' });
    const transactions = JSON.parse(content);
    const formattedTransaction = (0, exports.reduceTransactionsPerUserId)(transactions);
    (0, exports.printFormattedTransactions)(formattedTransaction);
};
exports.getTransactionFile = getTransactionFile;
const printFormattedTransactions = (values) => {
    var _a, _b, _c, _d, _e, _f;
    let output = [];
    for (const [key, value] of Object.entries(values)) {
        output.push({
            'User ID': key,
            GBP: (0, exports.sum)((_a = value[types_1.CurrencyType.GBP]) === null || _a === void 0 ? void 0 : _a.values) || '-',
            USD: (0, exports.sum)((_b = value[types_1.CurrencyType.USD]) === null || _b === void 0 ? void 0 : _b.values) || '-',
            EUR: (0, exports.sum)((_c = value[types_1.CurrencyType.EUR]) === null || _c === void 0 ? void 0 : _c.values) || '-',
            'Last Activity': (0, exports.getLatestDate)([
                ...(((_d = value[types_1.CurrencyType.GBP]) === null || _d === void 0 ? void 0 : _d.timestamps) || []),
                ...(((_e = value[types_1.CurrencyType.USD]) === null || _e === void 0 ? void 0 : _e.timestamps) || []),
                ...(((_f = value[types_1.CurrencyType.EUR]) === null || _f === void 0 ? void 0 : _f.timestamps) || []),
            ]),
        });
    }
    console.table(output);
    return output;
};
exports.printFormattedTransactions = printFormattedTransactions;
const reduceTransactionsPerUserId = (transactions) => {
    const userTransactions = transactions.reduce((previousValue, currentValue) => {
        if (!(currentValue === null || currentValue === void 0 ? void 0 : currentValue.amount) ||
            !(currentValue === null || currentValue === void 0 ? void 0 : currentValue.currency) ||
            !(currentValue === null || currentValue === void 0 ? void 0 : currentValue.user_id) ||
            !(currentValue === null || currentValue === void 0 ? void 0 : currentValue.timestamp)) {
            return previousValue;
        }
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
exports.reduceTransactionsPerUserId = reduceTransactionsPerUserId;
const getLatestDate = (dates) => {
    if (!dates || dates.length === 0) {
        return;
    }
    return dates.reduce((a, b) => (a > b ? a : b));
};
exports.getLatestDate = getLatestDate;
const sum = (array) => {
    if (!array || array.length === 0) {
        return;
    }
    const total = array.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    return (total <= 0 ? '' : '+') + (total === null || total === void 0 ? void 0 : total.toFixed(2).toString());
};
exports.sum = sum;
/**
 * Command Help
 */
const printHelp = () => {
    const msg = `
A simple command which reads transactions from a given JSON file

Example:

$ ./bin/index.js src/transactions.json

`;
    console.log(msg);
};
const symbols = getArgs();
// Print help if no arguments
if (symbols.length === 0) {
    printHelp();
}
symbols.forEach((symbol) => {
    (0, exports.getTransactionFile)(symbol);
});
//# sourceMappingURL=index.js.map