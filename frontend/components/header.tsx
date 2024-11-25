"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { Shrikhand } from "next/font/google";

const shrikhand = Shrikhand({
  weight: "400",
});

export const Header = () => {
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
        <h1
          className={
            shrikhand.className +
            " text-2xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-400 px-1"
          }
        >
          Grooove
        </h1>
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
        <NavbarItem className="hidden lg:flex">
          <Link href="/login">Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="primary" href="#" variant="flat">
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};
