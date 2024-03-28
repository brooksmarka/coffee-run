type Coworker = {
    drink: string;
    price: number;
    totalPaid: number;
};

export type CoffeeData = {
    coworkers: Record<string, Coworker>;
    nextPayer: string;
};