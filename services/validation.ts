export const isValidPhone = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone);
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidGST = (gst: string): boolean => {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst.toUpperCase());
};

export const isValidPAN = (pan: string): boolean => {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
};

export const isValidIFSC = (ifsc: string): boolean => {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
};

export const isValidAccountNumber = (acc: string): boolean => {
  return /^[0-9]{9,18}$/.test(acc);
};

export const maskAccountNumber = (acc: string): string => {
  if (acc.length < 4) return acc;
  const last4 = acc.slice(-4);
  return `****${last4}`;
};

export const getBankNameFromIFSC = (ifsc: string): string => {
  const code = ifsc.slice(0, 4).toUpperCase();
  const map: Record<string, string> = {
    HDFC: 'HDFC Bank',
    ICIC: 'ICICI Bank',
    SBIN: 'State Bank of India',
    AXIS: 'Axis Bank',
    KKBK: 'Kotak Mahindra Bank',
  };
  return map[code] || 'Unknown Bank';
};
