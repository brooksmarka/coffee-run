import fs from 'fs';
import readlineSync from 'readline-sync'
import chalk from 'chalk';

const dataFile = 'coffeeData.json';

function fetchCoffeeData() {
    try {
        var data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch (error) {
        console.log("there has been an error" ,error)
    }

    displayOrders(data);

    let response = '';
    do {
        response = readlineSync.question(chalk.yellow('Would you like to change it? y/n: '));
        if (response !== 'y' && response !== 'n') {
            console.log(chalk.red("Invalid input. Please only press 'y' or 'n'."));
        }
    } while (response !== 'y' && response !== 'n');

    if (response === 'y') {
        return getCoffeeOrders(data);
    } else {
        // 'n' was chosen
        return data;
    }

}

function costOfCoffeeRun(coffeeData){
    let totalCost = 0;

    for (let coworkerKey in coffeeData.coworkers) {
        let price = parseFloat(coffeeData.coworkers[coworkerKey].price);
        
        totalCost += price;
    }
    console.log(chalk.red(`the totalCost for this coffee run was: ${totalCost}`))
    return totalCost;

}

function displayOrders(data){
    console.log(chalk.green(`Hello! ${data.nextPayer} is up to pay! Here are the Current coffee orders:`));
    for (let coworkerKey in data.coworkers) {
        console.log(chalk.blue(`${coworkerKey}: ${data.coworkers[coworkerKey].drink} at ${data.coworkers[coworkerKey].price}`));
    }
}

function getCoffeeOrders(data){
    let isUpdating = 'y';

    while (isUpdating === 'y') {
    
       displayOrders(data);

        let coworkerName = readlineSync.question(chalk.yellow('Enter the name of the person whose order you want to update: '));

        if (data.coworkers[coworkerName]) {
            let drink = readlineSync.question('Enter the new drink: ');
            let price = readlineSync.question('Enter the new price: ');
            data.coworkers[coworkerName].drink = drink;
            data.coworkers[coworkerName].price = parseFloat(price);
        } else {
            console.log("No such person in the coffee orders.");
        }

        isUpdating = readlineSync.question('Would you like to update another order? (y/n): ');
    }
    
    return data;
}

function coffeeRun (coffeeData, totalCost, personToPay){

    for(let coworkerKey in coffeeData.coworkers){
        
        let coworker = coffeeData.coworkers[coworkerKey]
        let totalPaid = parseFloat(coffeeData.coworkers[coworkerKey].totalPaid);

        if(coworkerKey === personToPay){
            coffeeData.coworkers[coworkerKey].totalPaid = totalPaid + totalCost;
            console.log(chalk.blue(`this is the new total for coworker ${coworkerKey} which is: ${coffeeData.coworkers[coworkerKey].totalPaid}`))
        }
    
    }

}

function updateNextPayer(coffeeData) {
    let minPaid = null;
    let nextPayer = null;

    for(let coworkerKey in coffeeData.coworkers){
        let totalPaid = coffeeData.coworkers[coworkerKey].totalPaid
        if (minPaid === null || totalPaid < minPaid) {
            minPaid = totalPaid;
            nextPayer = coworkerKey;
        }
    }

    if(nextPayer !== null){
        //this is the person to pay
        console.log(chalk.green(`the next person to pay should be: ${nextPayer}`))
        coffeeData.nextPayer = nextPayer;
    }else{
        console.log("We could not determine the next payer")
    }
}

// Main program function
function writeToFile() {

    fs.writeFileSync(dataFile, JSON.stringify(coffeeData, null, 2), 'utf8');
}

let coffeeData = fetchCoffeeData();

const totalCostForCoffeeRun = costOfCoffeeRun(coffeeData);

coffeeRun(coffeeData,totalCostForCoffeeRun, coffeeData.nextPayer);

updateNextPayer(coffeeData);

writeToFile();