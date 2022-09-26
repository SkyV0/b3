    <Meta title="Upload | Just B3" description="Upload" image="/favicon.png" />
      <Box as="section" pb={{ base: '1' }}>
      <Box as="nav" bg="bg-surface" boxShadow={useColorModeValue('sm', 'sm-dark')}>
      <Navbar />
      <Container py={{ base: '4', md: '8' }}>
    <Stack spacing="5">
      <VStack spacing="4" direction={{ base: 'column', sm: 'row' }} justify="space-between">
            <Box className="text-2xl font-bold">Upload video</Box>
            <Text className="text-gray-400 mt-2">Post a video to your account</Text>
            <Box className="flex flex-wrap gap-3 mt-20">
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
      <Stack>
            <Box className="flex-end ml-10 ">
              <Box className="flex-grow">
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
                </Box>
              </Box>
      </Stack>
    </Stack>
    </Container>
  </Box>
  </Box>