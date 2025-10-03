export declare const generateQuestion: (level: "easy" | "medium" | "hard", questionNumber: number) => Promise<{
    id: string;
    text: string;
    level: "easy" | "medium" | "hard";
    timeLimit: number;
}>;
export declare const scoreAnswer: (question: string, answer: string) => Promise<{
    score: number;
    reasoning: string;
    breakdown: {
        technical_accuracy: number;
        clarity: number;
        completeness: number;
        depth: number;
    };
}>;
export declare const generateSummary: (questions: any[]) => Promise<string>;
//# sourceMappingURL=aiHelpers.d.ts.map