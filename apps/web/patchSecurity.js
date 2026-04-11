const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, 'src/app/account/security/page.tsx');
let content = fs.readFileSync(file, 'utf8');

const normalize = (str) => str.replace(/\r\n/g, '\n');

// Replace mock password change
const mockPasswordChange = `// TODO: Implement actual API call
      // const response = await fetch("/api/v1/security/change-password", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": \`Bearer \${localStorage.getItem("ascension-auth-token")}\`,
      //   },
      //   body: JSON.stringify({
      //     currentPassword: passwordData.currentPassword,
      //     newPassword: passwordData.newPassword,
      //   }),
      // });`;

const realPasswordChange = `const response = await fetch("/api/v1/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${localStorage.getItem("ascension-auth-token")}\`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password. Please check your current password and try again.");
      }`;

let modified = normalize(content);
modified = modified.replace(normalize(mockPasswordChange), normalize(realPasswordChange));

fs.writeFileSync(file, modified);
console.log("Patched security script");
