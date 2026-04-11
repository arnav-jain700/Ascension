const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, 'src/app/account/addresses/page.tsx');
let content = fs.readFileSync(file, 'utf8');

const normalize = (str) => str.replace(/\r\n/g, '\n');

// 1. Fetch addresses
const fetchAddressesMock = `// TODO: Implement actual API call
        // const response = await fetch("/api/v1/addresses", {
        //   headers: {
        //     "Authorization": \`Bearer \${localStorage.getItem("ascension-auth-token")}\`,
        //   },
        // });
        
        // Simulate API call with mock data
        setTimeout(() => {
          setAddresses([]);
          setLoading(false);
        }, 1000);`;

const fetchAddressesReal = `const response = await fetch("/api/v1/customers/addresses", {
          headers: {
            "Authorization": \`Bearer \${localStorage.getItem("ascension-auth-token")}\`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAddresses(data.data || []);
        } else {
          throw new Error("Failed to load");
        }
        setLoading(false);`;

// 2. Add / Update Address
const handleSubmitMock = `if (editingAddress) {
        // Update existing address
        const updatedAddresses = addresses.map(addr =>
          addr.id === editingAddress.id
            ? { ...formData, id: editingAddress.id, isDefault: editingAddress.isDefault }
            : addr
        );
        setAddresses(updatedAddresses);
        setEditingAddress(null);
      } else {
        // Add new address
        const newAddress: Address = {
          ...formData,
          id: Date.now().toString(),
          isDefault: addresses.length === 0, // First address is default
        };
        setAddresses([...addresses, newAddress]);
      }`;

const handleSubmitReal = `const method = editingAddress ? "PUT" : "POST";
      const url = editingAddress 
        ? \`/api/v1/customers/addresses/\${editingAddress.id}\`
        : "/api/v1/customers/addresses";

      const token = localStorage.getItem("ascension-auth-token");
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${token}\` },
        body: JSON.stringify(formData)
      });
      
      if (!resp.ok) throw new Error("Failed to save");

      const savedData = await resp.json();
      
      if (editingAddress) {
        setAddresses(addresses.map(a => a.id === editingAddress.id ? savedData.data : a));
        setEditingAddress(null);
      } else {
        setAddresses([savedData.data, ...addresses]);
      }`;

// 3. Delete Address
const handleDeleteMock = `const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      
      // If deleting default address, make another one default
      if (addresses.find(addr => addr.id === addressId)?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }
      
      setAddresses(updatedAddresses);`;

const handleDeleteReal = `const token = localStorage.getItem("ascension-auth-token");
      const resp = await fetch(\`/api/v1/customers/addresses/\${addressId}\`, {
        method: "DELETE",
        headers: { "Authorization": \`Bearer \${token}\` }
      });
      if (!resp.ok) throw new Error("Failed to delete");
      
      setAddresses(addresses.filter(addr => addr.id !== addressId));`;

// 4. Set Default
const handleSetDefaultMock = `const updatedAddresses = addresses.map(addr =>
        addr.id === addressId ? { ...addr, isDefault: true } : { ...addr, isDefault: false }
      );
      setAddresses(updatedAddresses);`;

const handleSetDefaultReal = `const token = localStorage.getItem("ascension-auth-token");
      const address = addresses.find(a => a.id === addressId);
      if (!address) return;
      const resp = await fetch(\`/api/v1/customers/addresses/\${addressId}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${token}\` },
        body: JSON.stringify({ isDefault: true })
      });
      if (!resp.ok) throw new Error("Failed");
      
      const updatedData = await resp.json();
      setAddresses(addresses.map(a => 
        a.id === addressId ? updatedData.data : { ...a, isDefault: false }
      ));`;


let modified = normalize(content);
modified = modified.replace(normalize(fetchAddressesMock), normalize(fetchAddressesReal));
modified = modified.replace(normalize(handleSubmitMock), normalize(handleSubmitReal));
modified = modified.replace(normalize(handleDeleteMock), normalize(handleDeleteReal));
modified = modified.replace(normalize(handleSetDefaultMock), normalize(handleSetDefaultReal));

fs.writeFileSync(file, modified);
console.log("Patched addresses script");
