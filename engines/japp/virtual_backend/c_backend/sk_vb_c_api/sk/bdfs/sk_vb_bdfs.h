#pragma once
#include <JuceHeader.h>
#include "../../../libs/ssc/json.hh"


#include "../../../../../../../../sk_vb_binarydata.hxx"



class SK_VirtualBackend;

class SK_VB_BDFS {
public:
    SK_VirtualBackend * vbe;
    
    SK_VB_BDFS(SK_VirtualBackend * _vbe);
    
    int handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);


    void access(String msgID, String path, String& responseData);
    void stat(String msgID, String path, String& responseData);
    void writeFile(String msgID, String path, String data, String& responseData);
    void readFile(String msgID, String path, String& responseData);
    void readdir(String msgID, String path, String& responseData);
    void readJSON(String msgID, String path, String& responseData);
    void writeJSON(String msgID, String path, String data, String& responseData);
};
