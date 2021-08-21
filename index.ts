import { perform, wrap } from "./lib.ts";

// Wrap only your root function, it should be absolutely pure
const showcase = wrap((greeting: string) => {
    // Use `perform` to run unpure computations
    const randomNumber = perform(() => Math.random());

    // You can extract unpure things out
    performLog(`${greeting} Here's a random number ${randomNumber}`);

    // You can even fetch stuff (or run any async computation)
    // even from deeply nested performs, no need for extra wraps.
    const fact = fetchCatFact();
    performLog(fact);

    // Return whatever you like
    return randomNumber;
});

// Make your own sync library
function performLog(msg: string) {
    return perform(() => console.log(msg));
}

function performFetch<Res>(url: string): Res {
    const res = perform(() => fetch(url).then((res) => res.json()));
    return res as Res;
}

function fetchCatFact(): string {
    const { fact } = performFetch<{ fact: string }>("https://catfact.ninja/fact");
    return fact;
}

// Only await the resulting function.
async function main() {
    const n = await showcase("Hello!");

    console.log(`Showcase ended, random number was ${n}`);
}

main();
