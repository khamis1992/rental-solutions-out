
export const validateCustomerData = (values: any) => {
  // Required fields validation
  if (!values.full_name?.trim()) {
    throw new Error("Full name is required");
  }
  
  if (!values.phone_number?.trim()) {
    throw new Error("Phone number is required");
  }

  if (!values.email?.trim()) {
    throw new Error("Email is required");
  }
  
  // Format validations
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(values.email)) {
    throw new Error("Invalid email format");
  }

  // Document expiry validation
  if (values.id_document_expiry && new Date(values.id_document_expiry) < new Date()) {
    throw new Error("ID document is expired");
  }

  if (values.license_document_expiry && new Date(values.license_document_expiry) < new Date()) {
    throw new Error("Driver's license is expired");
  }
  
  return true;
};
