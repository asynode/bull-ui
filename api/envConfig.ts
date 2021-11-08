export function getConfiguration(key: string): string | undefined {
    if (!key)
        return undefined;
    return process.env[key];
}

export function getConfigurations(keys: string[]): Map<string, string> {
    const config = new Map();
    keys.forEach((element) => {
        const temp = getConfiguration(element);
        if (temp) {
            config.set(element, temp);
        }
    })
    return config;
}
