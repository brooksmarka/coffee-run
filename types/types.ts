/**
 * Represents the details of a coworker's coffee order.
 * @property {string} drink - The type of drink ordered by the coworker.
 * @property {number} price - The price of the ordered drink.
 * @property {number} totalPaid - The total amount paid by the coworker so far.
 */
type Coworker = {
    drink: string;
    price: number;
    totalPaid: number;
};

/**
 * Represents the data structure for managing coffee orders within a team.
 * @property {Record<string, Coworker>} coworkers - A record of coworkers, where each key is a coworker's name and the value is their order details.
 * @property {string} nextPayer - The name of the coworker who is next in line to pay for the coffee run.
 */
export type CoffeeData = {
    coworkers: Record<string, Coworker>;
    nextPayer: string;
};