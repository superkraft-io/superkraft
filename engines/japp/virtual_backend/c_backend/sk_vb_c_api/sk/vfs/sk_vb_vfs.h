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
    
    void SK_VB_VFS::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);

    SK_VB_VFS_File* SK_VB_VFS::findByPath(String path);

    void SK_VB_VFS::access(String msgID, String path, String& responseData);
    void SK_VB_VFS::stat(String msgID, String path, String& responseData);
    void SK_VB_VFS::writeFile(String msgID, String path, String data, String& responseData);
    void SK_VB_VFS::readFile(String msgID, String path, String& responseData);
    void SK_VB_VFS::readdir(String msgID, String path, String& responseData);
    void SK_VB_VFS::readJSON(String msgID, String path, String& responseData);
    void SK_VB_VFS::writeJSON(String msgID, String path, String data, String& responseData);
};
