#pragma once

#include <JuceHeader.h>
#include <string>

#include "../../../ssc/core/json.hh"


using namespace SSC;

#define SET_CONSTANT(c) constants[#c] = (c);
static std::map<SSC::String, int32_t> getFSConstantsMap() {
    std::map<SSC::String, int32_t> constants;

#if defined(UV_DIRENT_UNKNOWN)
    SET_CONSTANT(UV_DIRENT_UNKNOWN)
#endif
#if defined(UV_DIRENT_FILE)
        SET_CONSTANT(UV_DIRENT_FILE)
#endif
#if defined(UV_DIRENT_DIR)
        SET_CONSTANT(UV_DIRENT_DIR)
#endif
#if defined(UV_DIRENT_LINK)
        SET_CONSTANT(UV_DIRENT_LINK)
#endif
#if defined(UV_DIRENT_FIFO)
        SET_CONSTANT(UV_DIRENT_FIFO)
#endif
#if defined(UV_DIRENT_SOCKET)
        SET_CONSTANT(UV_DIRENT_SOCKET)
#endif
#if defined(UV_DIRENT_CHAR)
        SET_CONSTANT(UV_DIRENT_CHAR)
#endif
#if defined(UV_DIRENT_BLOCK)
        SET_CONSTANT(UV_DIRENT_BLOCK)
#endif
#if defined(O_RDONLY)
        SET_CONSTANT(O_RDONLY);
#endif
#if defined(O_WRONLY)
    SET_CONSTANT(O_WRONLY);
#endif
#if defined(O_RDWR)
    SET_CONSTANT(O_RDWR);
#endif
#if defined(O_APPEND)
    SET_CONSTANT(O_APPEND);
#endif
#if defined(O_ASYNC)
    SET_CONSTANT(O_ASYNC);
#endif
#if defined(O_CLOEXEC)
    SET_CONSTANT(O_CLOEXEC);
#endif
#if defined(O_CREAT)
    SET_CONSTANT(O_CREAT);
#endif
#if defined(O_DIRECT)
    SET_CONSTANT(O_DIRECT);
#endif
#if defined(O_DIRECTORY)
    SET_CONSTANT(O_DIRECTORY);
#endif
#if defined(O_DSYNC)
    SET_CONSTANT(O_DSYNC);
#endif
#if defined(O_EXCL)
    SET_CONSTANT(O_EXCL);
#endif
#if defined(O_LARGEFILE)
    SET_CONSTANT(O_LARGEFILE);
#endif
#if defined(O_NOATIME)
    SET_CONSTANT(O_NOATIME);
#endif
#if defined(O_NOCTTY)
    SET_CONSTANT(O_NOCTTY);
#endif
#if defined(O_NOFOLLOW)
    SET_CONSTANT(O_NOFOLLOW);
#endif
#if defined(O_NONBLOCK)
    SET_CONSTANT(O_NONBLOCK);
#endif
#if defined(O_NDELAY)
    SET_CONSTANT(O_NDELAY);
#endif
#if defined(O_PATH)
    SET_CONSTANT(O_PATH);
#endif
#if defined(O_SYNC)
    SET_CONSTANT(O_SYNC);
#endif
#if defined(O_TMPFILE)
    SET_CONSTANT(O_TMPFILE);
#endif
#if defined(O_TRUNC)
    SET_CONSTANT(O_TRUNC);
#endif
#if defined(S_IFMT)
    SET_CONSTANT(S_IFMT);
#endif
#if defined(S_IFREG)
    SET_CONSTANT(S_IFREG);
#endif
#if defined(S_IFDIR)
    SET_CONSTANT(S_IFDIR);
#endif
#if defined(S_IFCHR)
    SET_CONSTANT(S_IFCHR);
#endif
#if defined(S_IFBLK)
    SET_CONSTANT(S_IFBLK);
#endif
#if defined(S_IFIFO)
    SET_CONSTANT(S_IFIFO);
#endif
#if defined(S_IFLNK)
    SET_CONSTANT(S_IFLNK);
#endif
#if defined(S_IFSOCK)
    SET_CONSTANT(S_IFSOCK);
#endif
#if defined(S_IRWXU)
    SET_CONSTANT(S_IRWXU);
#endif
#if defined(S_IRUSR)
    SET_CONSTANT(S_IRUSR);
#endif
#if defined(S_IWUSR)
    SET_CONSTANT(S_IWUSR);
#endif
#if defined(S_IXUSR)
    SET_CONSTANT(S_IXUSR);
#endif
#if defined(S_IRWXG)
    SET_CONSTANT(S_IRWXG);
#endif
#if defined(S_IRGRP)
    SET_CONSTANT(S_IRGRP);
#endif
#if defined(S_IWGRP)
    SET_CONSTANT(S_IWGRP);
#endif
#if defined(S_IXGRP)
    SET_CONSTANT(S_IXGRP);
#endif
#if defined(S_IRWXO)
    SET_CONSTANT(S_IRWXO);
#endif
#if defined(S_IROTH)
    SET_CONSTANT(S_IROTH);
#endif
#if defined(S_IWOTH)
    SET_CONSTANT(S_IWOTH);
#endif
#if defined(S_IXOTH)
    SET_CONSTANT(S_IXOTH);
#endif
#if defined(F_OK)
    SET_CONSTANT(F_OK);
#endif
#if defined(R_OK)
    SET_CONSTANT(R_OK);
#endif
#if defined(W_OK)
    SET_CONSTANT(W_OK);
#endif
#if defined(X_OK)
    SET_CONSTANT(X_OK);
#endif

    return constants;
}

class SSC_IPC_Map_FSConstants {
public:
    SSC::JSON::Object get() {
        
        static auto constants = getFSConstantsMap();
        static auto data = SSC::JSON::Object{ constants };
        static auto json = SSC::JSON::Object::Entries{
          {"source", "fs.constants"},
          {"data", data}
        };

        return json;
	}
};
