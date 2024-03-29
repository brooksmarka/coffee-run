jest.mock('fs')

const fs = require('fs');
const readlineSync = require('readline-sync');
const chalk = require('chalk');
const { CoffeeRunManager } = require("../src/CoffeeRunManager");

jest.mock('../src/CoffeeRunManager');
jest.mock('readline-sync');

describe('writeToFile', () => {
  let coffeeRunManager;
  const mockFilePath = './mockData.json';
  const mockData = {
    coworkers: {
      "Alice": { totalPaid: 10 },
      "Bob": { totalPaid: 20 }
    },
    nextPayer: 'Alice'
  };

  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager(mockFilePath);
    coffeeRunManager.coffeeData = mockData;
  });

  it('should write the correct data to the file', () => {
    coffeeRunManager.writeToFile();

    // Verify that fs.writeFileSync is called correctly
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockFilePath,
      JSON.stringify(mockData, null, 2),
      'utf8'
    );
  });
});

describe('costOfCoffeeRun', () => {
  let coffeeRunManager;

  beforeEach(() => {
    let mockData = {
      coworkers: { 
        "Alice": { drink: "Latte", price: 3.5 },
        "Bob": { drink: "Espresso", price: 2.0 }
      },
      nextPayer: 'Alice'
    };

    coffeeRunManager = new CoffeeRunManager('./mockData.json');
    coffeeRunManager.coffeeData = mockData; // Set the mock data
  });

  it('should calculate the total cost correctly', () => {
    const totalCost = coffeeRunManager.costOfCoffeeRun();
    // Asserting that the total cost is calculated correctly
    expect(totalCost).toBe(5.5); // 3.5 (Alice's latte) + 2.0 (Bob's espresso)
  });
});

describe('updateNextPayer', () => {
  let coffeeRunManager;

  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager('./mockData.json');
  });

  it('should update next payer correctly when one coworker has paid the least', () => {
    coffeeRunManager.coffeeData = {
      coworkers: {
        "Alice": { totalPaid: 10 },
        "Bob": { totalPaid: 15 },
        "Charlie": { totalPaid: 20 }
      },
      nextPayer: ''
    };

    coffeeRunManager.updateNextPayer();
    expect(coffeeRunManager.coffeeData.nextPayer).toBe('Alice');
  });

});

describe('coffeeRun', () => {
  let coffeeRunManager;

  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager('./mockData.json');
  });

  it('should correctly update the total paid amount for the person paying', () => {
    coffeeRunManager.coffeeData = {
      coworkers: {
        "Alice": { totalPaid: 10 },
        "Bob": { totalPaid: 20 },
        "Charlie": { totalPaid: 30 }
      },
      nextPayer: ''
    };

    const totalCost = 15;
    const personToPay = 'Bob';

    coffeeRunManager.coffeeRun(totalCost, personToPay);

    expect(coffeeRunManager.coffeeData.coworkers[personToPay].totalPaid).toBe(35); // 20 (original) + 15 (total cost)
  });

});

describe('displayOrders', () => {
  let coffeeRunManager;
  let mockData;

  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager();
    mockData = {
      coworkers: {
        "Alice": { drink: "Latte", price: 3.5 },
        "Bob": { drink: "Espresso", price: 2.0 }
      },
      nextPayer: 'Alice'
    };
  });

  it('should correctly display the coffee orders', () => {
    // Mock console.log
    console.log = jest.fn();

    coffeeRunManager.displayOrders(mockData);

    // Check if console.log was called with the correct arguments
    expect(console.log).toHaveBeenCalledWith(chalk.green.bold.underline(`Hello! ${mockData.nextPayer} is up to pay! Here are the Current coffee orders:\n`));
    expect(console.log).toHaveBeenCalledWith(chalk.magentaBright(`Alice: ${mockData.coworkers.Alice.drink} at ${mockData.coworkers.Alice.price}`));
    expect(console.log).toHaveBeenCalledWith(chalk.magentaBright(`Bob: ${mockData.coworkers.Bob.drink} at ${mockData.coworkers.Bob.price}`));
  });
});

describe('getCoffeeOrders', () => {
  let coffeeRunManager;
  let mockData;

  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager();
    mockData = {
      coworkers: {
        "Alice": { drink: "Latte", price: 3.5 },
        "Bob": { drink: "Espresso", price: 2.0 }
      },
      nextPayer: 'Alice'
    };
  });

  it('should correctly update coffee orders based on user input', () => {
    // Simulate user inputs
    readlineSync.question
      .mockReturnValueOnce('Alice')      // Enter the name of the person
      .mockReturnValueOnce('Cappuccino') // New drink
      .mockReturnValueOnce('4.0')        // New price
      .mockReturnValueOnce('n');         // Update another order? No

    const updatedData = coffeeRunManager.getCoffeeOrders(mockData);

    // Assertions to check if the data was updated correctly
    expect(updatedData.coworkers['Alice'].drink).toBe('Cappuccino');
    expect(updatedData.coworkers['Alice'].price).toBe(4.0);
  });
});

describe('handleCoffeeDataUpdates', () => {
  let coffeeRunManager;
  let mockData;

  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager();
    mockData = {
      coworkers: {
        "Alice": { drink: "Latte", price: 3.5 },
        "Bob": { drink: "Espresso", price: 2.0 }
      },
      nextPayer: 'Alice'
    };
    coffeeRunManager.coffeeData = mockData;
  });

  it('returns unchanged data on input "n"', () => {
    readlineSync.question.mockImplementationOnce(() => 'n');
    const result = coffeeRunManager.handleCoffeeDataUpdates();
    expect(result).toBe(mockData);
  });

  it('calls getCoffeeOrders on input "y"', () => {
    readlineSync.question.mockImplementationOnce(() => 'y');
    coffeeRunManager.getCoffeeOrders = jest.fn().mockImplementation(() => 'updated data');
    const result = coffeeRunManager.handleCoffeeDataUpdates();
    expect(coffeeRunManager.getCoffeeOrders).toHaveBeenCalledWith(mockData);
    expect(result).toBe('updated data');
  });

  it('handles invalid input and then proceeds on valid input', () => {
    readlineSync.question
      .mockImplementationOnce(() => 'invalid')
      .mockImplementationOnce(() => 'n');
    console.log = jest.fn(); // Mock console.log to verify the warning message
    const result = coffeeRunManager.handleCoffeeDataUpdates();
    expect(console.log).toHaveBeenCalledWith(chalk.red(`\nInvalid input. Please only press 'y' or 'n'.`));
    expect(result).toBe(mockData);
  });

});

describe('fetchCoffeeData', () => {
  let coffeeRunManager;
  const mockFilePath = './mockData.json';

  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager();
  });

  it('should return parsed data from the file', () => {
    const mockData = { coworkers: {"Alice": { drink: "Latte", price: 3.5 }}, nextPayer: 'Alice' };
    fs.readFileSync.mockImplementation(() => JSON.stringify(mockData));

    const result = coffeeRunManager.fetchCoffeeData(mockFilePath);
    expect(result).toEqual(mockData);
  });

  it('should return default data on error', () => {
    fs.readFileSync.mockImplementation(() => { throw new Error('File not found') });
    console.log = jest.fn(); // Mock console.log to verify the error message

    const result = coffeeRunManager.fetchCoffeeData(mockFilePath);
    expect(result).toEqual({ coworkers: {}, nextPayer: '' });
    expect(console.log).toHaveBeenCalledWith(`error fetching coffee data from file ${mockFilePath}`, expect.any(Error));
  });
});


it("it should mock coffeerunmanager", () => {
  const costOfCoffeeRunMock = jest.fn();
  jest.spyOn(CoffeeRunManager.prototype, "costOfCoffeeRun").mockImplementation(costOfCoffeeRunMock);
});



