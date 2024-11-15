const timingMiddleware = (req, res, next) => {
    const start = Date.now();
    const requestPath = `${req.method} ${req.path}`;

    console.log(`\n[${new Date().toISOString()}] Starting ${requestPath}`);

    // Override res.json to capture when the response is sent
    const originalJson = res.json;
    res.json = function (data) {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] Completed ${requestPath} in ${duration}ms\n`);
        return originalJson.call(this, data);
    };

    next();
};

module.exports = timingMiddleware;