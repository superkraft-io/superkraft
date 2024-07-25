#pragma once
#include <JuceHeader.h>

class SK_VB_VFS_File {
public:
    String path;
    String data;
    int ctime;
    int mtime;
    int atime;

    size_t SK_VB_VFS_File::getSize() {
        return data.length();
    }
};
