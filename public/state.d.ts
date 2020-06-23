declare const swService: import("xstate").Interpreter<{
    currentTerm: any;
}, any, import("xstate").AnyEventObject, {
    value: any;
    context: {
        currentTerm: any;
    };
}>;
export default swService;
