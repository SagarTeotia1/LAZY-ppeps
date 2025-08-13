'use client';
import { useAtom } from 'jotai';
import { activeSideBarItem } from '../configs/constant';

const useSidebar = () => {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSideBarItem);
  return { activeSidebar, setActiveSidebar };
};

export default useSidebar;
