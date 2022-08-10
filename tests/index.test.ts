import 'jest';
import {
  sum,
  getLatestDate,
  reduceTransactionsPerUserId,
  printFormattedTransactions,
} from '../src/index';
import { CurrencyType, Transaction } from '../src/types';

const transactions: Transaction[] = [
  {
    user_id: '4a1b84f7-9756-4549-837e-9574c7ffc142',
    timestamp: '2022-08-08T22:15:28.327Z',
    currency: 'USD',
    amount: '-12.00',
  },
  {
    user_id: '4a1b84f7-9756-4549-837e-9574c7ffc142',
    timestamp: '2022-01-08T22:15:28.327Z',
    currency: 'EUR',
    amount: '84.00',
  },
  {
    user_id: 'faf4a6fe-c839-4ee3-ac11-ee3957ac6332',
    timestamp: '2022-08-08T22:15:28.327Z',
    currency: 'EUR',
    amount: '22',
  },
];

describe('Transactions', () => {
  it('Should perform sum to all numbers in array', () => {
    expect(sum([1, -2, 3, -12, 50, -32])).toEqual('+8.00');
  });

  it('Should return the latest date', () => {
    expect(
      getLatestDate([
        '2022-08-08T14:15:28.327Z',
        '2022-08-08T22:15:28.327Z',
        '2022-08-08T17:15:28.327Z',
        '2022-08-09T19:25:28.327Z',
        '2022-08-09T12:15:28.327Z',
      ])
    ).toEqual('2022-08-09T19:25:28.327Z');
  });

  it('Should format the transactions', () => {
    const expectedResult = Object.assign(
      {},
      {
        [CurrencyType.USD]: {
          type: CurrencyType.USD,
          values: [-12.0],
          timestamps: ['2022-08-08T22:15:28.327Z'],
        },
        [CurrencyType.EUR]: {
          type: CurrencyType.EUR,
          values: [84.0],
          timestamps: ['2022-01-08T22:15:28.327Z'],
        },
      }
    );
    const result = reduceTransactionsPerUserId(transactions);
    expect(result['4a1b84f7-9756-4549-837e-9574c7ffc142']).toEqual(
      expectedResult
    );
  });

  it('Should format the transactions to be displayed in an array', () => {
    const result = reduceTransactionsPerUserId([
      {
        user_id: '4a1b84f7-9756-4549-837e-9574c7ffc142',
        timestamp: '2022-08-08T22:15:28.327Z',
        currency: 'USD',
        amount: '-12.00',
      },
    ]);
    const output = printFormattedTransactions(result);
    console.log(output);
    expect(output).toEqual([
      {
        'User ID': '4a1b84f7-9756-4549-837e-9574c7ffc142',
        GBP: '-',
        USD: '-12.00',
        EUR: '-',
        'Last Activity': '2022-08-08T22:15:28.327Z',
      },
    ]);
  });
});
