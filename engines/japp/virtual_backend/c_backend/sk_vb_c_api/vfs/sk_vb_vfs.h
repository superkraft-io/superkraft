#pragma once
#include <JuceHeader.h>
#include "sk_vb_vfs_file.h"
#include "../../libs/ssc/json.hh"

class SK_VirtualBackend;

class SK_VFS {
public:
    SK_VirtualBackend * vbe;
    
    std::vector<SK_VFS_File*> entries;

    SK_VFS(SK_VirtualBackend * _vbe);
    
    void SK_VFS::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);

    SK_VFS_File* SK_VFS::findByPath(String path);

    void respondError(String msgID, String error, String& responseData);
    void access(String msgID, String path, String& responseData);
    void stat(String msgID, String path, String& responseData);
    void writeFile(String msgID, String path, String data, String& responseData);
    void readFile(String msgID, String path, String& responseData);
    void readdir(String msgID, String path, String& responseData);
    void readJSON(String msgID, String path, String& responseData);
    void writeJSON(String msgID, String path, String data, String& responseData);
};
