jest.mock('fs');

const fs = require('fs');
const readlineSync = require('readline-sync');
const chalk = require('chalk');
const { CoffeeRunManager } = require("../src/CoffeeRunManager");

jest.mock('../src/CoffeeRunManager');
jest.mock('readline-sync');

const mockFilePath = './mockData.json';
let coffeeRunManager;
const mockPaymentData = {
  coworkers: {
    "Alice": { totalPaid: 10 },
    "Bob": { totalPaid: 20 },
    "Charlie": { totalPaid: 30 }
  },
  nextPayer: 'Alice'
};

const mockOrderData = {
  coworkers: {
    "Alice": { drink: "Latte", price: 3.5 },
    "Bob": { drink: "Espresso", price: 2.0 }
  },
  nextPayer: 'Alice'
};

describe('writeToFile', () => {

  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager(mockFilePath);
    coffeeRunManager.coffeeData = mockPaymentData;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should write the correct data to the file', () => {
    coffeeRunManager.writeToFile();

    // Verify that fs.writeFileSync is called correctly
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockFilePath,
      JSON.stringify(mockPaymentData, null, 2),
      'utf8'
    );
  });
});

describe('costOfCoffeeRun', () => {

  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager(mockFilePath);
    coffeeRunManager.coffeeData = mockOrderData; // Set the mock data
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should calculate the total cost correctly', () => {
    const totalCost = coffeeRunManager.costOfCoffeeRun();
    // Asserting that the total cost is calculated correctly
    expect(totalCost).toBe(5.5); // 3.5 (Alice's latte) + 2.0 (Bob's espresso)
  });
});

describe('updateNextPayer', () => {
  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager(mockFilePath);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should update next payer correctly when one coworker has paid the least', () => {
    coffeeRunManager.coffeeData = mockPaymentData;

    mockPaymentData.nextPayer = '';

    coffeeRunManager.updateNextPayer();
    expect(coffeeRunManager.coffeeData.nextPayer).toBe('Alice');
  });

});

describe('coffeeRun', () => {
  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager(mockFilePath);
  });

  afterEach(() => {
    jest.resetAllMocks();
  })

  it('should correctly update the total paid amount for the person paying', () => {
    coffeeRunManager.coffeeData = mockPaymentData;

    const totalCost = 15;
    const personToPay = 'Bob';

    coffeeRunManager.coffeeRun(totalCost, personToPay);

    expect(coffeeRunManager.coffeeData.coworkers[personToPay].totalPaid).toBe(35); // 20 (original) + 15 (total cost)
  });

});

describe('displayOrders', () => {

  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should correctly display the coffee orders', () => {
    // Mock console.log
    console.log = jest.fn();

    coffeeRunManager.displayOrders(mockOrderData);

    // Check if console.log was called with the correct arguments
    expect(console.log).toHaveBeenCalledWith(chalk.green.bold.underline(`Hello! ${mockOrderData.nextPayer} is up to pay! Here are the Current coffee orders:\n`));
    expect(console.log).toHaveBeenCalledWith(chalk.magentaBright(`Alice: ${mockOrderData.coworkers.Alice.drink} at $${mockOrderData.coworkers.Alice.price}`));
    expect(console.log).toHaveBeenCalledWith(chalk.magentaBright(`Bob: ${mockOrderData.coworkers.Bob.drink} at $${mockOrderData.coworkers.Bob.price}`));
  });
});

describe('getCoffeeOrders', () => {
  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should correctly update coffee orders based on user input', () => {
    // Simulate user inputs
    readlineSync.question
      .mockReturnValueOnce('Alice')      // Enter the name of the person
      .mockReturnValueOnce('Cappuccino') // New drink
      .mockReturnValueOnce('4.0')        // New price
      .mockReturnValueOnce('n');         // Update another order? No

    const updatedData = coffeeRunManager.getCoffeeOrders(mockOrderData);

    // Assertions to check if the data was updated correctly
    expect(updatedData.coworkers['Alice'].drink).toBe('Cappuccino');
    expect(updatedData.coworkers['Alice'].price).toBe(4.0);
  });
});

describe('handleCoffeeDataUpdates', () => {
  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager();
    coffeeRunManager.coffeeData = mockOrderData;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns unchanged data on input "n"', () => {
    readlineSync.question.mockImplementationOnce(() => 'n');
    const result = coffeeRunManager.handleCoffeeDataUpdates();
    expect(result).toBe(mockOrderData);
  });

  it('calls getCoffeeOrders on input "y"', () => {
    readlineSync.question.mockImplementationOnce(() => 'y');
    coffeeRunManager.getCoffeeOrders = jest.fn().mockImplementation(() => 'updated data');
    const result = coffeeRunManager.handleCoffeeDataUpdates();
    expect(coffeeRunManager.getCoffeeOrders).toHaveBeenCalledWith(mockOrderData);
    expect(result).toBe('updated data');
  });

  it('handles invalid input and then proceeds on valid input', () => {
    readlineSync.question
      .mockImplementationOnce(() => 'invalid')
      .mockImplementationOnce(() => 'n');
    console.log = jest.fn(); // Mock console.log to verify the warning message
    const result = coffeeRunManager.handleCoffeeDataUpdates();
    expect(console.log).toHaveBeenCalledWith(chalk.red(`\nInvalid input. Please only press 'y' or 'n'.`));
    expect(result).toBe(mockOrderData);
  });

});

describe('fetchCoffeeData', () => {

  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return parsed data from the file', () => {
    fs.readFileSync.mockImplementation(() => JSON.stringify(mockOrderData));

    const result = coffeeRunManager.fetchCoffeeData(mockFilePath);
    expect(result).toEqual(mockOrderData);
  });

  it('should return default data on error', () => {
    fs.readFileSync.mockImplementation(() => { throw new Error('File not found') });
    console.log = jest.fn(); // Mock console.log to verify the error message

    const result = coffeeRunManager.fetchCoffeeData(mockFilePath);
    expect(result).toEqual({ coworkers: {}, nextPayer: '' });
    expect(console.log).toHaveBeenCalledWith(`error fetching coffee data from file ${mockFilePath}`, expect.any(Error));
  });
});


