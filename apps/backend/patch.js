const fs = require('fs');
const path = require('path');

function patchFile(filePath, replacements) {
    const fullPath = path.resolve(__dirname, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(fullPath, content);
    console.log(`Patched ${filePath}`);
}

patchFile('src/routes/auth.ts', [
    [/userSession/g, 'session'],
    [/token,/g, 'sessionToken: token,'],
    [/expiresAt:/g, 'expires:'],
    [/password: _/g, 'passwordHash: _'],
    [/password: /g, 'passwordHash: '],
    [/password,/g, 'passwordHash,'],
    [/firstName: true,\s*lastName: true,/g, 'name: true,'],
    [/firstName,\s*lastName,/g, 'name,'],
    [/user\.password/g, 'user.passwordHash'],
    [/updateData\.firstName = firstName;/g, 'updateData.name = name;'],
    [/updateData\.lastName = lastName;/g, ''],
    [/req\.headers\.authorization;\s*const token = authHeader\?\.substring\(7\);\s*if \(token\) {\s*\/\/ Delete session\s*await prisma\.userSession\.deleteMany\(\{/g, 'req.headers.authorization;\n  const token = authHeader?.substring(7);\n\n  if (token) {\n    await prisma.session.deleteMany({'],
    [/where: \{ token \}/g, 'where: { sessionToken: token }'],
    [/data: updateData,/g, 'data: updateData,']
]);

patchFile('src/middleware/auth.ts', [
    [/firstName: true,\s*lastName: true,/g, 'name: true,'],
    [/firstName: string;\s*lastName: string;/g, 'name: string;'],
    [/firstName: user\.firstName,\s*lastName: user\.lastName,/g, 'name: user.name,'],
]);

patchFile('src/routes/fileUpload.ts', [
    [/\(process\.env as any\)\.UPLOAD_DIR \|\| "\.\/uploads"/g, '((process.env as any).UPLOAD_DIR as string) || "./uploads"'],
]);

patchFile('src/routes/analytics.ts', [
    [/groupBy\({\s*by: \["product"\],/g, 'groupBy({\n      by: ["productId"],'],
    [/include: {\s*items: {\s*include: {\s*product: true,\s*},\s*},\s*},/g, 'include: { items: { include: { product: true } } }'],
]);
