"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    if (err.name === "ZodError") {
        return res.status(400).json({
            error: "Validation error",
            details: err.errors,
        });
    }
    if (err.code === "P2002") {
        return res.status(409).json({
            error: "Duplicate entry",
            field: err.meta?.target,
        });
    }
    res.status(err.status || 500).json({
        error: err.message || "Internal server error",
    });
};
exports.errorHandler = errorHandler;
