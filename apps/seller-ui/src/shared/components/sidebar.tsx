'use client';
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import useSidebar from '../../hooks/use.Sidebar';
import useSeller from '../../hooks/use.seller';
import Box from './box';
import { Sidebar } from './sidebar.style';
import Logo from '../../assets/svgs/logo';
import Link from 'next/link';
import Home from '../../assets/icons/home';
import SidebarItem from './sidebar.item';
import HomeIcon from '../../assets/icons/home';
import SidebarMenu from './sidebar.menu';
import {
  BellPlus,
  BellRing,
  CalendarPlus,
  ListOrdered,
  LogOutIcon,
  Mail,
  PackageSearch,
  Settings,
  SquarePlus,
  TicketPercent,
} from 'lucide-react';
import PaymentIcon from '../../assets/icons/payment';

const SidebarBarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { seller } = useSeller();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? '#0085ff' : '#969696';

  return (
    <Box
      className="sidebar-wrapper"
      css={{
        height: '100vh',
        zIndex: 202,
        position: 'sticky',
        padding: '8px',
        top: '0',
        overflowY: 'auto', // <== This is the key change
        scrollbarWidth: 'none',
      }}
    >
      <Sidebar.Header>
        <Box>
          <Link href="/" className="flex justify-center text-center gap-2">
            <Logo />
            <Box>
              <h3>{seller?.shop?.name}</h3>
              <h5>{seller?.shop?.address}</h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={<HomeIcon fill={getIconColor('/dashboard')} />}
            isActive={activeSidebar === '/dashboard'}
            href="/dashboard"
          />

          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/orders'}
                title="Orders"
                href="/dashboard/orders"
                icon={
                  <ListOrdered
                    size={26}
                    color={getIconColor('/dashboard/orders')}
                  />
                }
              />
              <SidebarItem
                title="Payments"
                icon={
                  <PaymentIcon fill={getIconColor('/dashboard/payments')} />
                }
                isActive={activeSidebar === '/dashboard/payments'}
                href="/dashboard/payments"
              />
            </SidebarMenu>
            <SidebarMenu title="Products">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/create-product'}
                title="Create product"
                href="/dashboard/create-product"
                icon={
                  <SquarePlus
                    size={26}
                    color={getIconColor('/dashboard/create-product')}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/all-products'}
                title="All Products"
                href="/dashboard/all-products"
                icon={
                  <PackageSearch
                    size={22}
                    color={getIconColor('/dashboard/all-products')}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Events">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/create-event'}
                title="Create Event"
                href="/dashboard/create-event"
                icon={
                  <CalendarPlus
                    size={24}
                    color={getIconColor('/dashboard/create-event')}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/all-events'}
                title="All Events"
                href="/dashboard/all-event"
                icon={
                  <BellPlus
                    size={24}
                    color={getIconColor('/dashboard/all-event')}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/inbox'}
                title="Inbox"
                href="/dashboard/inbox"
                icon={
                  <Mail size={20} color={getIconColor('/dashboard/inbox')} />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/settings'}
                title="Settings"
                href="/dashboard/settings"
                icon={
                  <Settings
                    size={20}
                    color={getIconColor('/dashboard/settings')}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/notifications'}
                title="Notifications"
                href="/dashboard/notifications"
                icon={
                  <BellRing
                    size={20}
                    color={getIconColor('/dashboard/notifications')}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Extras">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/discount-codes'}
                title="Discount Codes"
                href="/dashboard/discount-codes"
                icon={
                  <TicketPercent
                    size={20}
                    color={getIconColor('/dashboard/discount-codes')}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/logout'}
                title="Logout"
                href="/dashboard/logout"
                icon={
                  <LogOutIcon
                    size={20}
                    color={getIconColor('/dashboard/logout')}
                  />
                }
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SidebarBarWrapper;
