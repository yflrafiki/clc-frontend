import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const MembersContext = createContext(null);

export function MembersProvider({ children }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const membersRef = useRef([]);

  const fetchMembers = useCallback(async (force = false) => {
    if (!user) {
      membersRef.current = [];
      setMembers([]);
      return [];
    }

    const allowedRoles = [1, 2, 3];
    if (!allowedRoles.includes(user.role_id)) {
      membersRef.current = [];
      setMembers([]);
      return [];
    }

    if (!force && membersRef.current.length > 0) {
      return membersRef.current;
    }

    setLoadingMembers(true);
    try {
      const res = await API.get('/members');
      const nextMembers = Array.isArray(res.data) ? res.data : [];
      membersRef.current = nextMembers;
      setMembers(nextMembers);
      return nextMembers;
    } catch (error) {
      console.error('Failed to load members:', error);
      return [];
    } finally {
      setLoadingMembers(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      membersRef.current = [];
      setMembers([]);
      return;
    }

    if (![1, 2, 3].includes(user.role_id)) {
      membersRef.current = [];
      setMembers([]);
      return;
    }

    fetchMembers(true);
  }, [user, fetchMembers]);

  return (
    <MembersContext.Provider value={{ members, fetchMembers, loadingMembers }}>
      {children}
    </MembersContext.Provider>
  );
}

export const useMembers = () => useContext(MembersContext);
