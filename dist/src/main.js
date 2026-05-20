"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
async function bootstrap() {
    const server = await (0, server_1.createApp)();
    const port = parseInt(process.env.PORT ?? '3001', 10);
    server.listen(port, () => {
        console.log(`Finova API running on http://localhost:${port}`);
        console.log(`Swagger docs at http://localhost:${port}/api/docs`);
    });
}
void bootstrap();
//# sourceMappingURL=main.js.map