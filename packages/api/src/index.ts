import { createApp } from "./infrastructure/http/app";

const app = createApp();

const PORT = 4000;
app.listen(PORT, () => console.log(`api on http://localhost:${PORT}`));