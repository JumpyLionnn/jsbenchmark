export async function waitUntilNextEventCycle(): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(undefined);
        });
    });
}