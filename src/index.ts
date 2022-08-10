#!/usr/bin/env node
import * as fs from 'fs';
import * as Path from 'path';
import { CurrencyType, Transaction, FormattedTransaction } from './types';

const FILE_MAX_SIZE = 0.01 * 1000 * 1024; // 5mb
/**
 *  return the arguments of the command except node and index.ts
 */
const getArgs = (): string[] => {
  // We retrieve all the command arguments except the first 2
  const args = process.argv.slice(2);
  return args;
};

export const getTransactionFile = (fileName: string): void => {
  const packageJSONPath = Path.resolve(__dirname, `../${fileName}`);

  const { size } = fs.statSync(packageJSONPath);

  if (size >= FILE_MAX_SIZE) {
    console.log(`File is to big. It needs to be less than ${FILE_MAX_SIZE / (1000 * 1024)} Mb`);
    return;
  }

  const content = fs.readFileSync(packageJSONPath, { encoding: 'utf8' });
  const transactions = JSON.parse(content) as Transaction[];
  const formattedTransaction = reduceTransactionsPerUserId(transactions);
  printFormattedTransactions(formattedTransaction);
};

export const printFormattedTransactions = (values: FormattedTransaction[]) => {
  let output = [];
  for (const [key, value] of Object.entries(values)) {
    output.push({
      'User ID': key,
      GBP: sum(value[CurrencyType.GBP]?.values) || '-',
      USD: sum(value[CurrencyType.USD]?.values) || '-',
      EUR: sum(value[CurrencyType.EUR]?.values) || '-',
      'Last Activity': getLatestDate([
        ...(value[CurrencyType.GBP]?.timestamps || []),
        ...(value[CurrencyType.USD]?.timestamps || []),
        ...(value[CurrencyType.EUR]?.timestamps || []),
      ]),
    });
  }
  console.table(output);
  return output;
};

export const reduceTransactionsPerUserId = (
  transactions: Transaction[]
): FormattedTransaction[] => {
  const userTransactions: FormattedTransaction[] = transactions.reduce(
    (previousValue, currentValue) => {
      if (
        !currentValue?.amount ||
        !currentValue?.currency ||
        !currentValue?.user_id ||
        !currentValue?.timestamp
      ) {
        return previousValue;
      }
      if (previousValue[currentValue.user_id]) {
        if (previousValue[currentValue.user_id][currentValue.currency]) {
          previousValue[currentValue.user_id][
            currentValue.currency
          ].values.push(Number(currentValue.amount));
          previousValue[currentValue.user_id][
            currentValue.currency
          ].timestamps.push(currentValue.timestamp);
        } else {
          previousValue[currentValue.user_id] = {
            ...previousValue[currentValue.user_id],
            [currentValue.currency]: {
              type: currentValue.currency,
              values: [Number(currentValue.amount)],
              timestamps: [currentValue.timestamp],
            },
          };
        }
      } else {
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
    },
    []
  );
  return userTransactions;
};

export const getLatestDate = (dates: string[]): string => {
  if (!dates || dates.length === 0) {
    return;
  }
  return dates.reduce((a, b) => (a > b ? a : b));
};

export const sum = (array: number[]): string => {
  if (!array || array.length === 0) {
    return;
  }

  const total = array.reduce(
    (previousValue, currentValue) => previousValue + currentValue,
    0
  );
  return (total <= 0 ? '' : '+') + total?.toFixed(2).toString();
};

/**
 * Command Help
 */
const printHelp = (): void => {
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
  getTransactionFile(symbol);
});
