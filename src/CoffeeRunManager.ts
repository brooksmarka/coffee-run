import fs from 'fs';
import readlineSync from 'readline-sync'
import chalk from 'chalk';
import { CoffeeData } from '../types/types.js'

export class CoffeeRunManager {
    public coffeeData: CoffeeData;
    public dataFilePath: string;

    constructor(dataFile: string) {
        this.dataFilePath = dataFile;
        this.coffeeData = { coworkers: {}, nextPayer: '' };
    }

    /**
     * Reads and parses the coffee data from a specified file.
     * This function attempts to read the coffee data from the provided file. If it succeeds,
     * the data is parsed from JSON and returned. If there is an error (e.g., file not found),
     * it logs the error and returns a default CoffeeData object.
     * 
     * @param {string} dataFile - The path to the json file containing the coffee data.
     * @returns {CoffeeData} The parsed coffee data from the file or a default object if an error occurs.
    */
    public fetchCoffeeData(dataFile: string): CoffeeData {
        try {
            const rawData = fs.readFileSync(dataFile, 'utf8');
            return JSON.parse(rawData);
    
        } catch (error) {
            console.error(`error fetching coffee data from file ${dataFile}`, error)
    
            return { coworkers: {}, nextPayer: ''}
        }
    }

    /**
     * Handles user interactions for updating the coffee data.
     * This method prompts the user to decide whether they want to update any coffee orders.
     * If the user chooses to update (responds with 'y'), it calls `getCoffeeOrders` to perform the updates.
     * If the user chooses not to update (responds with 'n'), it simply returns the current coffee data.
     * The method repeats the prompt until a valid response ('y' or 'n') is provided.
     * 
     * @returns {CoffeeData} The updated coffee data after handling any changes, or the current data if no updates are made.
    */
    public handleCoffeeDataUpdates(): CoffeeData{
        let response = '';
        do {
            response = readlineSync.question(chalk.yellow(`\nWould you like to change it? (y/n): `));
            if (response !== 'y' && response !== 'n') {
                console.log(chalk.red(`\nInvalid input. Please only press 'y' or 'n'.`));
            }
        } while (response !== 'y' && response !== 'n');
    
        if (response === 'y') {
            return this.getCoffeeOrders();
        } else {
            // 'n' was chosen
            return this.coffeeData;
        }
    }

    /**
     * Interactively updates the coffee orders for the coworkers.
     * This method prompts the user to update the drink order for a selected coworker. 
     * It displays the current orders, allows the user to specify a coworker's name, and then
     * inputs the new drink and price for that coworker. 
     * @returns The updated CoffeeData object after making the requested changes to the orders.
    */
    public getCoffeeOrders(): CoffeeData{
        let isUpdating = 'y';
    
        while (isUpdating === 'y') {
        
           this.displayOrders();
    
            let coworkerName = readlineSync.question(chalk.yellow('Enter the name of the person whose order you want to update: '));
    
            if (this.coffeeData.coworkers[coworkerName]) {
                let drink = readlineSync.question('Enter the new drink: ');
                let price = readlineSync.question('Enter the new price: ');
                this.coffeeData.coworkers[coworkerName].drink = drink;
                this.coffeeData.coworkers[coworkerName].price = parseFloat(price);
            } else {
                console.error(chalk.red("No such person in the coffee orders."));
            }
    
            isUpdating = readlineSync.question(chalk.yellow('Would you like to update another order? (y/n): '));
        }
        
        return this.coffeeData;
    }

    /**
     * Displays the current coffee order
     * @returns void 
    */
    public displayOrders(): void{
        console.log(chalk.green.bold.underline(`Hello! ${this.coffeeData.nextPayer} is up to pay! Here are the Current coffee orders:\n`));
        for (const coworkerKey in this.coffeeData.coworkers) {
            console.log(chalk.magentaBright(`${coworkerKey}: ${this.coffeeData.coworkers[coworkerKey].drink} at $${this.coffeeData.coworkers[coworkerKey].price}`));
        }
    }

    /**
     * Updates the total paid amount for the coworker who is paying for this coffee run.
     * @returns void
    */
    public coffeeRun (): void{

        let totalCost = 0;
    
        for (let coworkerKey in this.coffeeData.coworkers) {
            let price = this.coffeeData.coworkers[coworkerKey].price;
            totalCost += price;
        }
        console.log(chalk.magenta(`the total cost for this coffee run was: ${totalCost}\n`))

        for(const coworkerKey in this.coffeeData.coworkers){
            
            const totalPaid = this.coffeeData.coworkers[coworkerKey].totalPaid;

            if(coworkerKey === this.coffeeData.nextPayer){
                this.coffeeData.coworkers[coworkerKey].totalPaid = totalPaid + totalCost;
                console.log(chalk.whiteBright.underline(`Coworker ${coworkerKey} just had to pay ${totalCost}\n`))
            }
        
        }

    }

    /**
     * Identifies and updates the next coworker who should pay for the coffee run.
     * This method goes through each coworker's total paid amount and finds the one 
     * who has paid the least. This coworker is then designated as the next person to pay.
     * If a next payer is found, their name is logged to the console and updated in the coffee data.
     * If no next payer can be determined an error message is logged
     * @returns void
    */
    public updateNextPayer(): void {
        let minPaid = null;
        let nextPayer = null;
    
        for(let coworkerKey in this.coffeeData.coworkers){
            let totalPaid = this.coffeeData.coworkers[coworkerKey].totalPaid
            if (minPaid === null || totalPaid < minPaid) {
                minPaid = totalPaid;
                nextPayer = coworkerKey;
            }
        }
    
        if(nextPayer !== null){
            //this is the person to pay
            console.log(chalk.green(`the next person to pay should be: ${nextPayer}\n`))
            this.coffeeData.nextPayer = nextPayer;
        }else{
            console.error("We could not determine the next payer")
        }
    }

    /**
     * Writes the current state of coffee data to a file.
     * This method serializes the coffeeData object into JSON and writes it to the specified data file.
     * It uses a pretty-print format with a 2-space indent for readability.
     * 
     * Note: The method assumes that `dataFile` is a valid file path and that the application has write permissions.
     */
    public writeToFile() {

        fs.writeFileSync(this.dataFilePath, JSON.stringify(this.coffeeData, null, 2), 'utf8');
    }

    /**
     * Initiates and manages the process of a coffee run.
     * This public method starts the coffee run process by first calculating the total cost of the coffee run,
     * then executing the coffeeRun method with the calculated total cost and the current next payer.
     * After the coffee run, it updates who the next payer should be and writes the updated data back to the file.
     * 
     * This method acts as the primary entry point for the coffee run workflow.
     */
    public startCoffeeRun(){
        let keepRunning = true;

        while(keepRunning){
            //setup for the coffee run
            this.coffeeData = this.fetchCoffeeData(this.dataFilePath);
            this.displayOrders();
            this.handleCoffeeDataUpdates();

            //We are now ready to perform the coffee run
            this.coffeeRun();
            this.updateNextPayer();
            this.writeToFile();

            // Ask if they want to start another coffee run
            const response = readlineSync.question(chalk.yellow('Start another coffee run? (y/n): '));
            if (response.toLowerCase() !== 'y') {
                console.log(chalk.green('Thank you for using Coffee Run Manager!'));
                return true;
            }
        }

        return false;
    }

}
