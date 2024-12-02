"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  cn,
  Avatar,
} from "@nextui-org/react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import useSWR from "swr";

import { shrikhand } from "@/config/fonts";
import { useUserId } from "@/hooks/useUserId";
import { getUserById } from "@/util/api";

export const Header = () => {
  const userId = useUserId();

  const { data } = useSWR(
    () => (userId == null ? null : [userId, "getUserById"]),
    ([id, _]) => getUserById(id),
  );

  const pathname = usePathname();

  function getIsActive(path: string): boolean {
    return path === pathname;
  }

  function getColor(path: string): "primary" | "foreground" {
    return getIsActive(path) ? "primary" : "foreground";
  }

  return (
    <Navbar isBordered>
      <NavbarBrand>
        <NextLink href="/">
          <p
            className={cn(
              shrikhand.className,
              "text-2xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-400 px-1 select-none",
            )}
          >
            Grooove
          </p>
        </NextLink>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem isActive={getIsActive("/")}>
          <Link color={getColor("/")} href="/">
            Browse
          </Link>
        </NavbarItem>
        <NavbarItem isActive={pathname === "/create"}>
          <Link color={getColor("/create")} href="/create">
            Create
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        {userId == null ? (
          <>
            <NavbarItem className="hidden lg:flex">
              <Link href="/login">Login</Link>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} color="primary" href="/signup" variant="flat">
                Sign Up
              </Button>
            </NavbarItem>
          </>
        ) : (
          <NavbarItem>
            <Link href="/profile">
              <div className="flex gap-2 items-center">
                <p className="text-sm">{data ? data.username : ""}</p>
                <Avatar showFallback />
              </div>
            </Link>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
};
