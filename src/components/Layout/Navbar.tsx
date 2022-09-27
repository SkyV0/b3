import Image from "next/future/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { FC, FormEvent, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { BiSearch, BiUser } from "react-icons/bi";
import { IoLogOutOutline } from "react-icons/io5";
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Container,
  Divider,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  Text,
  Heading,
  InputGroup,
  InputLeftElement,
  useBreakpointValue,
  useColorModeValue,
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText
} from '@chakra-ui/react';
import ClickAwayListener from "../Shared/ClickAwayListener";
import { ColorModeSwitcher } from "../Home/ColorModeSwitcher";
import {HamburgerIcon, SmallCloseIcon, AtSignIcon} from '@chakra-ui/icons';
import { NextChakraLink } from "../Layout/NextChakraLink";

const Navbar: FC = () => {
  const router = useRouter();
const isDesktop = useBreakpointValue({ base: false, lg: true })
  const { data: session, status } = useSession();

  const [isDropdownOpened, setIsDropdownOpened] = useState(false);

  const [inputValue, setInputValue] = useState(
    router.pathname === "/search" && typeof router.query.q === "string"
      ? (router.query.q as string)
      : ""
  );

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (inputValue.trim()) {
      router.push({ pathname: "/search", query: { q: inputValue.trim() } });
    }
  };

  return (
 <Box as="section" pb={{ base: '2' }}>
      <Box as="nav" bg="bg-surface" boxShadow={useColorModeValue('sm', 'sm-dark')}>
        <Container>
          <Flex justify="space-between" py={{ base: '3', lg: '4' }}> 
          <Box position="absolute" left="2" top="2" >
            <NextChakraLink href='/' >
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
            </NextChakraLink>
            </Box>
            <Box sx={{ '--my-color': '#a78bfa' }}>
  <Heading color='var(--my-color)' size='md'>
  <NextChakraLink href='/' >
    Just B3
    </NextChakraLink>
  </Heading>
</Box>
              <HStack spacing="4">   
              {isDesktop && (
          <InputGroup maxW={{ sm: 'md' }} justifySelf="center">
          <InputLeftElement pointerEvents="none">
            <Icon as={BiSearch} color="muted" boxSize="5" />
          </InputLeftElement>
          <Input     type="text"
              placeholder="Search..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)} />
        </InputGroup>
              )}
                <ColorModeSwitcher />
              <Button color='#a78bfa' width='60' href={status === "authenticated" ? "/upload" : "/sign-in"}>
                <NextChakraLink href={status === "authenticated" ? "/upload" : "/sign-in"}>
                Upload
                </NextChakraLink>
                </Button>
                {status === "unauthenticated" ? (   
                  <Button color='#a78bfa' width='60' href="/sign-in">
              <NextChakraLink href="/sign-in">
                  Log In
              </NextChakraLink>
              </Button>
            ) : status === "authenticated" ? (
              <ClickAwayListener onClickAway={() => setIsDropdownOpened(false)}>
                {(ref) => (
                  <div ref={ref} className="relative">
                    <button
                      onClick={() => setIsDropdownOpened(!isDropdownOpened)}
                    >
                      <Image
                        width={80}
                        position="absolute"
                        right='2'
                        top='1'
                        height={80}
                        className="rounded-full"
                        src={session.user?.image!}
                        alt="Avatar"
                      />
                    </button>
                    <Box
                      className={`absolute shadow-[rgb(0_0_0_/_12%)_0px_4px_16px] bg-white top-[120%] right-0 py-2 flex flex-col items-stretch [&>*]:whitespace-nowrap rounded-md transition-all z-50 ${
                        isDropdownOpened
                          ? "opacity-100 visible"
                          : "opacity-0 invisible"
                      }`}
                    >
                      {/* @ts-ignore */}
                      <Link href={`/user/${session?.user?.id}`}>
                        <a className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition">
                          <AtSignIcon color='black' />
                          <Text color="black">Profile</Text>
                        </a>
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition"
                      >
                        <SmallCloseIcon color='black'/>
                        <Text color="black">Sign out</Text>
                      </button>
                    </Box>
                  </div>
                )}
              </ClickAwayListener>
            ) : (
              <></>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  </Box>
  );
};

export default Navbar;
