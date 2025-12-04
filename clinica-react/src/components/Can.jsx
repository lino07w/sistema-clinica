import { useAuth } from '../context/AuthContext';

const Can = ({ roles, children, fallback = null }) => {
  const { hasRole } = useAuth();
  
  if (hasRole(roles)) {
    return children;
  }
  
  return fallback;
};

export default Can;