interface BenchmarkResults {
    results: Map<number, {
        runTime: number;
        amountOfRounds: number;
        error?: Error;
    }>;
    time: number;
}
export default BenchmarkResults;