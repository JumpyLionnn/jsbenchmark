interface BenchmarkResults {
    results: Map<number, {
        amountOfRounds: number;
        error?: Error;
    }>;
}
export default BenchmarkResults;