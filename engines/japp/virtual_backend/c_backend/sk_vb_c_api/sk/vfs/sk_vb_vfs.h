#pragma once
#include <JuceHeader.h>
#include "sk_vb_vfs_file.h"
#include "../../../libs/ssc/json.hh"

class SK_VirtualBackend;

class SK_VB_VFS {
public:
    SK_VirtualBackend * vbe;
    
    std::vector<SK_VB_VFS_File*> entries;

    SK_VB_VFS(SK_VirtualBackend * _vbe);
    
    void handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);

    SK_VB_VFS_File* findByPath(String path);

    void access(String msgID, String path, String& responseData);
    void stat(String msgID, String path, String& responseData);
    void writeFile(String msgID, String path, String data, String& responseData);
    void readFile(String msgID, String path, String& responseData);
    void readdir(String msgID, String path, String& responseData);
    void readJSON(String msgID, String path, String& responseData);
    void writeJSON(String msgID, String path, String data, String& responseData);
};
