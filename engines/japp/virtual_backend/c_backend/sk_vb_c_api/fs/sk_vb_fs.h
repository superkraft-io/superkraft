#pragma once
#include <JuceHeader.h>
#include "../../libs/ssc/json.hh"

class SK_VirtualBackend;

class SK_FS {
public:
    SK_VirtualBackend * vbe;

    SK_FS(SK_VirtualBackend * _vbe);
    
    static String SK_FS::getProjectPath();
    
    void SK_FS::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);
    
    void respondError(String msgID, String error, String& responseData);
    
    void access(String msgID, String path, String& responseData);
    void stat(String msgID, String path, String& responseData);
    void writeFile(String msgID, String path, String data, String& responseData);
    void readFile(String msgID, String path, String& responseData);
    void readdir(String msgID, String path, String& responseData);
    void readJSON(String msgID, String path, String& responseData);
    void writeJSON(String msgID, String path, String data, String& responseData);
};
