import { CoffeeRunManager } from './CoffeeRunManager.js';

const coffeeRunManager = new CoffeeRunManager('src/data/coffeeData.json');

const exitApplication = coffeeRunManager.startCoffeeRun();
if (exitApplication) {
    process.exit();
}

process.on('SIGINT', () => {
    console.log(('\nGracefully shutting down'));
    process.exit();
});