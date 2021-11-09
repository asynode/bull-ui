

export default class Utility {
    static toNumber(obj: string | number): number {
        if (typeof obj == 'number')
            return obj;
        if (!obj)
            throw new Error('Invalid numeric parameter!');
        const value = Number(obj);
        if (isNaN(value))
            throw new Error('Invalid numeric parameter!');
        return value;
    }
}

