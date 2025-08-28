// utils/reduxHelpers.js

export const handleAsyncCases = (builder, thunk, handlers = {}) => {
    const {
        onPending = () => { },
        onFulfilled = () => { },
        onRejected = () => { }
    } = handlers;

    builder
        .addCase(thunk.pending, (state) => {
            state.loading = true;
            state.error = null;
            onPending(state);
        })
        .addCase(thunk.fulfilled, (state, action) => {
            state.loading = false;
            onFulfilled(state, action);
        })
        .addCase(thunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            onRejected(state, action);
        });
};
