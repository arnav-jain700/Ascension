const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, 'src/routes/auth.ts');
let content = fs.readFileSync(file, 'utf8');

const normalize = (str) => str.replace(/\r\n/g, '\n');

const replacements = [
  {
    target: `router.get("/profile", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {`,
    rep: `router.get("/profile", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {`
  },
  {
    target: `router.put("/profile", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {`,
    rep: `router.put("/profile", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {`
  },
  {
    target: `router.put("/change-password", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {`,
    rep: `router.put("/change-password", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {`
  },
  {
    target: `router.get("/sessions", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {`,
    rep: `router.get("/sessions", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {`
  },
  {
    target: `router.delete("/sessions/:sessionId", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {`,
    rep: `router.delete("/sessions/:sessionId", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {`
  },
  {
    target: `router.post("/logout", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {`,
    rep: `router.post("/logout", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {`
  }
];

let normalizedContent = normalize(content);

replacements.forEach(({target, rep}) => {
  normalizedContent = normalizedContent.replace(normalize(target), normalize(rep));
});

fs.writeFileSync(file, normalizedContent);
console.log('Patched auth middleware');
