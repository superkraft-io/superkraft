#pragma once
#include <JuceHeader.h>
#include "../../../../libs/ssc/json.hh"

class SK_VirtualBackend;

class SK_FS {
public:
    SK_VirtualBackend * vbe;

    SK_FS(SK_VirtualBackend * _vbe);
    
    static String getProjectPath();
    
    bool pathExists(String path);
    bool isAbsolutePath(String path);
    
    
    void handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);
    
    void access(String msgID, String path, String& responseData);
    void _stat(String msgID, String path, String& responseData);
    void writeFile(String msgID, String path, String data, String& responseData);
    void readFile(String msgID, String path, String& responseData);
    void readdir(String msgID, String path, String& responseData);
    void unlink(String msgID, String path, String& responseData);
    void mkdir(String msgID, String path, String& responseData);
};
