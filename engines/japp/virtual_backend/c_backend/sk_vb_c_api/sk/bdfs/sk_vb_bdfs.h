#pragma once
#include <JuceHeader.h>
#include "../../../libs/ssc/json.hh"


#include "../../../../../../../../sk_vb_binarydata.hxx"



class SK_VirtualBackend;

class SK_VB_BDFS {
public:
    SK_VirtualBackend * vbe;
    
    SK_VB_BDFS(SK_VirtualBackend * _vbe);
    
    int SK_VB_BDFS::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);


    void SK_VB_BDFS::access(String msgID, String path, String& responseData);
    void SK_VB_BDFS::stat(String msgID, String path, String& responseData);
    void SK_VB_BDFS::writeFile(String msgID, String path, String data, String& responseData);
    void SK_VB_BDFS::readFile(String msgID, String path, String& responseData);
    void SK_VB_BDFS::readdir(String msgID, String path, String& responseData);
    void SK_VB_BDFS::readJSON(String msgID, String path, String& responseData);
    void SK_VB_BDFS::writeJSON(String msgID, String path, String data, String& responseData);
};
