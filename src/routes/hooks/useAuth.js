export const useAuth = () => {
  // This might come from Context, Redux, or Zustand
  const isAuthenticated = localStorage.getItem("AuthToken") ?  localStorage.getItem("AuthToken") === "Authenticated" : false; 
  return { isAuthenticated };
};