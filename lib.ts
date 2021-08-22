// We need any, this is too generic.
// deno-lint-ignore-file no-explicit-any

// Make a symbol to mark non-computed values, so it can't clash
// with whatever the user returns
const NOTHING = Symbol("Nothing");

// State is module-level, limitations not clear.
const values: any[] = [NOTHING];
let currentValue = 0;

class Effect<T> {
    constructor(public readonly thunk: () => T | Promise<T>) {}
}

// TODO: implement an API similar to Promise.all to support parallel effects
export function perform<T>(thunk: () => T | Promise<T>): T {
    const val = values[currentValue];

    if (val !== NOTHING) {
        currentValue++;
        return val;
    } else {
        throw new Effect(thunk);
    }
}

type AnyFunction = (...args: any[]) => any;

type Promisify<Fun extends AnyFunction> = (...args: Parameters<Fun>) => Promise<ReturnType<Fun>>;

export function wrap<T extends AnyFunction>(f: T): Promisify<T> {
    const wrappedFunction: Promisify<T> = async (...args) => {
        // Keep trying to call the wrapped function
        // Once every effect is performed, it'll return.
        for (;;) {
            try {
                return f(...args);
            } catch (err) {
                if (err instanceof Effect) {
                    values[currentValue] = await err.thunk();
                    values[currentValue + 1] = NOTHING;
                    currentValue = 0;
                } else {
                    throw err;
                }
            }
        }
    };

    return wrappedFunction;
}
