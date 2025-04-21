export const encodeUrl = (username: string, topic: string): string => {
  // Combine the strings with a delimiter
  const combined = `${username}|||${topic}`;
  
  // Convert to base64
  const base64 = btoa(combined);
  
  // Replace URL-unsafe chars
  const cleaned = base64
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  // Format as UUID-style string (8-4-4-4-remaining)
  const segments = [
    cleaned.slice(0, 8),      // 8 chars
    cleaned.slice(8, 12),     // 4 chars
    cleaned.slice(12, 16),    // 4 chars
    cleaned.slice(16, 20),    // 4 chars
    cleaned.slice(20)         // remaining chars
  ];
  
  return segments.join('-');
};

export const decodeUrl = (encoded: string): { username: string; topic: string } => {
  try {
    // Remove the dashes
    const cleaned = encoded.replace(/-/g, '');
    
    // Replace the URL-safe characters back
    const base64 = cleaned
      .replace(/-/g, '+')
      .replace(/_/g, '/');
      
    // Add back base64 padding if needed
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    
    // Decode base64
    const decoded = atob(padded);
    
    // Split on our delimiter
    const [username, topic] = decoded.split('|||');
    
    if (!username || !topic) {
      throw new Error('Invalid encoded string format');
    }
    
    return { username, topic };
  } catch (error) {
    throw new Error('Failed to decode chat URL');
  }
};

// export const hash_logic = async (str: string): Promise<string> => {
//   // Convert string to buffer using TextEncoder
//   const encoder = new TextEncoder();
//   const data = encoder.encode(str);
  
//   // Use Web Crypto API to create SHA-1 hash
//   const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  
//   // Convert buffer to hex string
//   const hashArray = Array.from(new Uint8Array(hashBuffer));
//   const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
//   // Format as UUID (same as your original logic)
//   const segments = [
//     hash.slice(0, 8),     // 8 chars
//     hash.slice(8, 12),    // 4 chars
//     hash.slice(12, 16),   // 4 chars
//     hash.slice(16, 20),   // 4 chars
//     hash.slice(20, 32)    // 12 chars
//   ];
  
//   return segments.join('-');
// };

// // Store for decoded values
// const decodingStore = new Map<string, string>();

// export const decodeChatUrl = (encoded: string): string | undefined => {
//   return decodingStore.get(encoded);
// };

// export const encodeChatUrl = async (original: string): Promise<string> => {
//   const encoded = await hash_logic(original);
//   decodingStore.set(encoded, original);
//   return encoded;
// };