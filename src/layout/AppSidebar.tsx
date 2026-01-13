"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";
import { useAuth } from "@/context/AuthContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};


const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Ecommerce", path: "/admin" }],
  },
  {
    icon: <UserCircleIcon />,
    name: "User",
    subItems: [
      { name: "User List", path: "/admin/users" },
      { name: "User Profile", path: "/admin/profile" },
      { name: "Test upload video", path: "/admin/files" },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/admin/line-chart" },
      { name: "Bar Chart", path: "/admin/bar-chart" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts" },
      { name: "Avatar", path: "/avatars" },
      { name: "Badge", path: "/badge" },
      { name: "Buttons", path: "/buttons" },
      { name: "Images", path: "/images" },
      { name: "Videos", path: "/videos" },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin" },
      { name: "Sign Up", path: "/signup" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();
  const filteredNavItems = useMemo<NavItem[]>(() => {
    if (!user) return navItems;

    return navItems.map((item) => {
      if (item.name === "User" && item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter((sub) => {
            if (sub.name === "User List") {
              return user.role === "admin";
            }
            return true;
          }),
        };
      }
      return item;
    });
  }, [user]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => path === pathname,
    [pathname]
  );

  useEffect(() => {
    let matched = false;

    (["main", "others"] as const).forEach((menuType) => {
      const items =
        menuType === "main" ? filteredNavItems : othersItems;

      items.forEach((nav, index) => {
        nav.subItems?.forEach((sub) => {
          if (isActive(sub.path)) {
            setOpenSubmenu({ type: menuType, index });
            matched = true;
          }
        });
      });
    });

    if (!matched) setOpenSubmenu(null);
  }, [pathname, isActive, filteredNavItems]);

  useEffect(() => {
    setOpenSubmenu(null);
  }, [user]);

  useEffect(() => {
    if (!openSubmenu) return;
    const key = `${openSubmenu.type}-${openSubmenu.index}`;
    const el = subMenuRefs.current[key];
    if (el) {
      setSubMenuHeight((prev) => ({
        ...prev,
        [key]: el.scrollHeight,
      }));
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (
    index: number,
    type: "main" | "others"
  ) => {
    setOpenSubmenu((prev) =>
      prev && prev.type === type && prev.index === index
        ? null
        : { type, index }
    );
  };

  const renderMenuItems = (
    items: NavItem[],
    type: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, type)}
              className={`menu-item group ${
                openSubmenu?.type === type && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              }`}
            >
              <span className="menu-item-icon">{nav.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto transition-transform ${
                    openSubmenu?.type === type &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item ${
                  isActive(nav.path)
                    ? "menu-item-active"
                    : "menu-item-inactive"
                }`}
              >
                <span className="menu-item-icon">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${type}-${index}`] = el;
              }}
              className="overflow-hidden transition-all"
              style={{
                height:
                  openSubmenu?.type === type &&
                  openSubmenu?.index === index
                    ? subMenuHeight[`${type}-${index}`]
                    : 0,
              }}
            >
              <ul className="ml-9 mt-2 space-y-1">
                {nav.subItems.map((sub) => (
                  <li key={sub.name}>
                    <Link
                      href={sub.path}
                      className={`menu-dropdown-item ${
                        isActive(sub.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-screen bg-white dark:bg-gray-900 border-r transition-all ${
        isExpanded || isHovered || isMobileOpen ? "w-[290px]" : "w-[90px]"
      }`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="py-8 px-5">
        <Link href="/admin">
          <Image
            src="/images/logo/logo.svg"
            alt="Logo"
            width={150}
            height={40}
          />
        </Link>
      </div>

      <nav className="px-5">
        {renderMenuItems(filteredNavItems, "main")}
      </nav>
    </aside>
  );
};

export default AppSidebar;
