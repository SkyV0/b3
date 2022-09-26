import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { DragEventHandler, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BsFillCloudUploadFill } from "react-icons/bs";

import Navbar from "@/components/Layout/Navbar";
import Meta from "@/components/Shared/Meta";
import { fetchWithProgress } from "@/utils/fetch";

import { trpc } from "../utils/trpc";
import { authOptions } from "./api/auth/[...nextauth]";
import { Flex, Box, Input, Text, Button, useColorModeValue, Container, Stack, VStack, HStack, StackDivider } from "@chakra-ui/react";
const Upload: NextPage = (props: BoxProps) => {
  const router = useRouter();

  const uploadMutation = trpc.useMutation("video.create");

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [coverImageURL, setCoverImageURL] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);
  const [inputValue, setInputValue] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isFileDragging, setIsFileDragging] = useState(false);

  useEffect(() => {
    if (uploadMutation.error) {
      toast.error("Failed to load the video", {
        position: "bottom-right",
      });
    }
  }, [uploadMutation.error]);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("video")) {
      toast("Only video file is allowed");
      return;
    }

    // Max 200MB file size
    if (file.size > 209715200) {
      toast("Max 200MB file size");
      return;
    }

    const url = URL.createObjectURL(file);

    setVideoFile(file);
    setVideoURL(url);

    const video = document.createElement("video");
    video.style.opacity = "0";
    video.style.width = "0px";
    video.style.height = "0px";

    document.body.appendChild(video);

    video.setAttribute("src", url);
    video.addEventListener("error", (error) => {
      console.log(error);
      document.body.removeChild(video);
      toast.error("Failed to load the video", {
        position: "bottom-right",
      });
    });

    video.addEventListener("loadeddata", () => {
      setTimeout(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        setVideoWidth(video.videoWidth);
        setVideoHeight(video.videoHeight);

        ctx.drawImage(video, 0, 0);
        setCoverImageURL(canvas.toDataURL("image/png"));

        document.body.removeChild(video);
      }, 300);
    });
    video.load();
  };

  const handleUpload = async () => {
    if (
      !coverImageURL ||
      !videoFile ||
      !videoURL ||
      !inputValue.trim() ||
      isLoading
    )
      return;

    setIsLoading(true);

    const toastID = toast.loading("Uploading...");

    try {
      const uploadedVideo = (
        await fetchWithProgress(
          "POST",
          new URL(
            "/upload?fileName=video.mp4",
            process.env.NEXT_PUBLIC_UPLOAD_URL!
          ).href,
          videoFile,
          (percentage) => {
            toast.loading(`Uploading ${percentage}%...`, { id: toastID });
          }
        )
      ).url;

      toast.loading("Uploading cover image...", { id: toastID });

      const coverBlob = await (await fetch(coverImageURL)).blob();

      const formData = new FormData();
      formData.append("file", coverBlob, "cover.png");
      formData.append("content", "From webhook");

      const uploadedCover = (
        await (
          await fetch(process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL!, {
            method: "POST",
            body: formData,
          })
        ).json()
      ).attachments[0].proxy_url;

      toast.loading("Uploading metadata...", { id: toastID });

      const created = await uploadMutation.mutateAsync({
        caption: inputValue.trim(),
        coverURL: uploadedCover,
        videoURL: uploadedVideo,
        videoHeight,
        videoWidth,
      });

      toast.dismiss(toastID);

      setIsLoading(false);

      router.push(`/video/${created.id}`);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.error("Failed to upload video", {
        position: "bottom-right",
        id: toastID,
      });
    }
  };

  const dragBlur: DragEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFileDragging(false);
  };

  const dragFocus: DragEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFileDragging(true);
  };

  const dropFile = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    let files = e.dataTransfer.files;

    if (files.length > 1) {
      toast("Only one file is allowed");
    } else {
      handleFileChange(files[0]);
    }

    setIsFileDragging(false);
  };

  return (
    <>
      <Meta title="Upload | Just B3" description="Upload" image="/favicon.png" />
      <Navbar />
      <Box
    as="form"
    bg="bg-surface"
    mx="40"
    mt="10"
    boxShadow={useColorModeValue('sm', 'sm-dark')}
    borderRadius="lg"
    {...props}
  >
    <Stack spacing="5" px={{ base: '4', md: '6' }} py={{ base: '5', md: '6' }}>
      <Stack spacing="6" direction={{ base: 'column', md: 'row' }}>
        <VStack spacing="20" pt="8">
        <Text className="text-2xl font-bold">Upload video</Text>
            <Box flexShrink={0}>
                {videoURL ? (
                <video
                  className="w-[250px] h-[340px] object-contain"
                  muted
                  autoPlay
                  controls
                  src={videoURL}
                  playsInline
                />
              ) : (
                <Button
                  onDrop={dropFile}
                  onDragLeave={dragBlur}
                  onDragEnter={dragFocus}
                  onDragOver={dragFocus}
                  onClick={() => inputRef.current?.click()}
                  className={`w-[250px] flex-shrink-0 border-2 border-gray-300 rounded-md border-dashed flex flex-col items-center p-8 cursor-pointer hover:border-red-1 transition ${
                    isFileDragging ? "border-violet-1" : ""
                  }`}
                >
                  <BsFillCloudUploadFill className="fill-[#B0B0B4] w-10 h-10" />
                  <Text className="font-semibold mt-4 mb-2">
                    Select video to upload
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Or drag and drop a file
                  </Text>

                  <Box className="flex flex-col items-center text-gray-400 my-4 gap-1 text-sm">
                    <p>MP4 or WebM</p>
                    <p>Any resolution</p>
                    <p>Any duration</p>
                    <p>Less than 200MB</p>
                  </Box>
                 <Box>
                  <Button className="w-full bg-violet Text-white p-2">
                    Select file
                  </Button>
                  </Box>
                </Button>
              )}

              <Input
                ref={inputRef}
                type="file"
                hidden
                className="hidden"
                accept="video/mp4,video/webm"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              </Box>
              </VStack>
            <Box
    borderRadius="lg"
    flex="1"
    {...props}>
      <Stack className="flex-end">
                 <label className="block font-medium" htmlFor="caption">
                  <Text>
                  Caption
                  </Text>
                </label>
                <Input
                  type="text"
                  id="caption"
                  className="p-2 w-full border border-gray-2 mt-1 mb-3 outline-none focus:border-gray-400 transition"
                  value={inputValue}
                  onChange={(e) => {
                    if (!isLoading) setInputValue(e.target.value);
                  }}
                />

                <Text className="font-medium">Cover</Text>
                <div className="p-2 border border-gray-2 h-[170px] mb-2">
                  {coverImageURL ? (
                    <img
                      className="h-full w-auto object-contain"
                      src={coverImageURL}
                      alt=""
                    />
                  ) : (
                    <div className="bg-gray-1 h-full w-[100px]"></div>
                  )}
                </div>
                  <Button
                    disabled={isLoading}
                    onClick={() => {
                      if (inputRef.current?.value) inputRef.current.value = "";
                      setCoverImageURL(null);
                      setInputValue("");
                      setVideoFile(null);
                      setVideoURL(null);
                    }}
                    className="py-3 min-w-[170px] border border-gray-2 bg-white hover:bg-gray-100 transition"
                  >
                    Discard
                  </Button>
                  <Button
                    onClick={() => handleUpload()}
                    disabled={
                      !inputValue.trim() ||
                      !videoURL ||
                      !videoFile ||
                      !coverImageURL ||
                      isLoading
                    }
                    className={`flex justify-center items-center gap-2 py-3 min-w-[170px] hover:brightness-90 transition text-white bg-red-1 disabled:text-gray-400 disabled:bg-gray-200`}
                  >
                    {isLoading && (
                      <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                    )}
                    Post
                  </Button>
    </Stack>
    </Box>
    </Stack>
    </Stack>
  </Box>
    </>
  );
};

export default Upload;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: true,
      },
      props: {},
    };
  }

  return {
    props: {
      session,
    },
  };
};
