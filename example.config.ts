import { defineConfig } from "./src/util"

export default defineConfig({
  hookPath: "/gitpullr-hook",
  hookPort: "8088",
  hookAddr: "https://your-server.com",
  projects: [
    {
      name: "your-username/your-project",
      path: "path/to/your-project",
      secret: "verysecret",
      exec: ["git pull", "npm run build", "pm2 restart your-project"],
      filter: "\\[skip backend\\]",
      plugins: {
        telegram: {
          token: "0987654321",
          chat: "1234567890",
          silent: true,
        },
      },
    },
    {
      name: "your-username/your-project2",
      path: "path/to/your-project2",
      secret: "verysecret2",
      exec: ["git pull", "npm run build", "pm2 restart your-project2"],
      filter: "\\[skip (?:backend|ci)\\]",
    },
  ],
})
