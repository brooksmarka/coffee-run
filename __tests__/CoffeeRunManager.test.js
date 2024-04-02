jest.mock('fs');

const fs = require('fs');
const readlineSync = require('readline-sync');
const chalk = require('chalk');
const { CoffeeRunManager } = require("../src/CoffeeRunManager");

jest.mock('../src/CoffeeRunManager');
jest.mock('readline-sync');

const mockFilePath = './mockData.json';
let coffeeRunManager;
const mockCoffeeData = {
  coworkers: {
    "Alice": { drink: "Latte", price: 3.5, totalPaid: 10 },
    "Bob": { drink: "Espresso", price: 2.0, totalPaid: 20  },
    "Charlie": { drink: "Hot Chocolate", price: 2.5, totalPaid: 30 }
  },
  nextPayer: 'Alice'
};

function setupCoffeeRunManager() {
  const manager = new CoffeeRunManager(mockFilePath);
  manager.coffeeData = mockCoffeeData;
  return manager;
}

describe('writeToFile', () => {

  beforeEach(() => {
    coffeeRunManager = setupCoffeeRunManager();
  });

  it('should write the correct data to the file', () => {
    coffeeRunManager.writeToFile();

    // Verify that fs.writeFileSync is called correctly
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockFilePath,
      JSON.stringify(mockCoffeeData, null, 2),
      'utf8'
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

describe('updateNextPayer', () => {
  beforeEach(() => {
    coffeeRunManager = setupCoffeeRunManager();
  });

  it('should update next payer correctly when one coworker has paid the least', () => {
    console.log = jest.fn();  //mock console log to not clutter test output
    
    coffeeRunManager.coffeeData.nextPayer = '';

    coffeeRunManager.updateNextPayer();
    expect(coffeeRunManager.coffeeData.nextPayer).toBe('Alice');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

});

describe('coffeeRun', () => {
  beforeEach(() => {
    coffeeRunManager = setupCoffeeRunManager();
  });

  it('should correctly update the total paid amount for the person paying', () => {
    coffeeRunManager.coffeeRun();
    expect(coffeeRunManager.coffeeData.coworkers['Alice'].totalPaid).toBe(14.5); // 10 (original) + 8 (total cost) - 3.5 (price)
  });

  afterEach(() => {
    jest.resetAllMocks();
  })
});

describe('displayOrders', () => {

  beforeEach(() => {
    coffeeRunManager = setupCoffeeRunManager();
  });

  it('should correctly display the coffee orders', () => {
    // Mock console.log
    console.log = jest.fn();

    coffeeRunManager.displayOrders();

    // Check if console.log was called with the correct arguments
    expect(console.log).toHaveBeenCalledWith(chalk.green.bold.underline(`Hello! ${coffeeRunManager.coffeeData.nextPayer} is up to pay! Here are the Current coffee orders:\n`));
    expect(console.log).toHaveBeenCalledWith(chalk.magentaBright(`Alice: ${coffeeRunManager.coffeeData.coworkers.Alice.drink} at $${coffeeRunManager.coffeeData.coworkers.Alice.price}`));
    expect(console.log).toHaveBeenCalledWith(chalk.magentaBright(`Bob: ${coffeeRunManager.coffeeData.coworkers.Bob.drink} at $${coffeeRunManager.coffeeData.coworkers.Bob.price}`));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

describe('getCoffeeOrders', () => {
  beforeEach(() => {
    coffeeRunManager = setupCoffeeRunManager();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should correctly update coffee orders based on user input', () => {
    // Simulate user inputs
    readlineSync.question
      .mockReturnValueOnce('Alice')      // Enter the name of the person
      .mockReturnValueOnce('Cappuccino') // New drink
      .mockReturnValueOnce('4')        // New price
      .mockReturnValueOnce('n');         // Update another order? No

    const updatedData = coffeeRunManager.getCoffeeOrders();

    // Assertions to check if the data was updated correctly
    expect(updatedData.coworkers['Alice'].drink).toBe('Cappuccino');
    expect(updatedData.coworkers['Alice'].price).toBe(4);
  });
});

describe('handleCoffeeDataUpdates', () => {
  beforeEach(() => {
    coffeeRunManager = setupCoffeeRunManager();
  });

  it('returns unchanged data on input "n"', () => {
    readlineSync.question.mockImplementationOnce(() => 'n');
    coffeeRunManager.handleCoffeeDataUpdates();
    expect(coffeeRunManager.coffeeData).toBe(mockCoffeeData);
  });

  it('calls getCoffeeOrders on input "y"', () => {
    readlineSync.question.mockImplementationOnce(() => 'y');
    coffeeRunManager.getCoffeeOrders = jest.fn();
    coffeeRunManager.handleCoffeeDataUpdates();
    expect(coffeeRunManager.getCoffeeOrders).toHaveBeenCalled();
  });

  it('handles invalid input and then proceeds on valid input', () => {
    readlineSync.question
      .mockImplementationOnce(() => 'invalid')
      .mockImplementationOnce(() => 'n');
    console.log = jest.fn(); // Mock console.log to verify the warning message
    coffeeRunManager.handleCoffeeDataUpdates();
    expect(console.log).toHaveBeenCalledWith(chalk.red(`\nInvalid input. Please only press 'y' or 'n'.`));
    expect(coffeeRunManager.coffeeData).toBe(mockCoffeeData);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

});

describe('fetchCoffeeData', () => {

  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager(mockFilePath);
  });

  it('should return parsed data from the file', () => {
    fs.readFileSync.mockImplementation(() => JSON.stringify(mockCoffeeData));

    const result = coffeeRunManager.fetchCoffeeData(mockFilePath);
    expect(result).toEqual(mockCoffeeData);
  });

  it('should return default data on error', () => {
    fs.readFileSync.mockImplementation(() => { throw new Error('File not found') });
    console.error = jest.fn(); // Mock console.log to verify the error message

    const result = coffeeRunManager.fetchCoffeeData(mockFilePath);
    expect(result).toEqual({ coworkers: {}, nextPayer: '' });
    expect(console.error).toHaveBeenCalledWith(`error fetching coffee data from file ${mockFilePath}`, expect.any(Error));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

describe('startCoffeeRun', () => {
  beforeEach(() => {
    coffeeRunManager = new CoffeeRunManager(mockFilePath);
    jest.spyOn(coffeeRunManager, 'fetchCoffeeData').mockImplementation(() => mockCoffeeData);
    jest.spyOn(coffeeRunManager, 'displayOrders').mockImplementation(() => {});
    jest.spyOn(coffeeRunManager, 'handleCoffeeDataUpdates').mockImplementation(() => {});
    jest.spyOn(coffeeRunManager, 'coffeeRun').mockImplementation(() => {});
    jest.spyOn(coffeeRunManager, 'updateNextPayer').mockImplementation(() => {});
    jest.spyOn(coffeeRunManager, 'writeToFile').mockImplementation(() => {});
    console.log = jest.fn(); // Mock console.log
  });

  it('should perform a coffee run and update data correctly', () => {
    readlineSync.question.mockImplementationOnce(() => 'n');

    const result = coffeeRunManager.startCoffeeRun();

    expect(coffeeRunManager.fetchCoffeeData).toHaveBeenCalledWith(mockFilePath);
    expect(coffeeRunManager.displayOrders).toHaveBeenCalled();
    expect(coffeeRunManager.handleCoffeeDataUpdates).toHaveBeenCalled();
    expect(coffeeRunManager.coffeeRun).toHaveBeenCalled();
    expect(coffeeRunManager.updateNextPayer).toHaveBeenCalled();
    expect(coffeeRunManager.writeToFile).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(chalk.green('Thank you for using Coffee Run Manager!'));
    expect(result).toBe(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});

