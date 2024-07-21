#pragma once


#include <JuceHeader.h>
#include "sk_view/sk_view.hxx"

class SK_VirtualBackend;

class SK_View_Mngr {
public:
    SK_VirtualBackend* vbe;

    std::vector<SK_View*> views;

    SK_View_Mngr(SK_VirtualBackend *_vbe);
    
    void resizeViews(int width, int height);
    SK_View* findViewByID(String viewID);

    void handle_IPC_Msg(String msgID, DynamicObject* obj, String& responseData);
    void createView(String msgID, var obj, String& responseData);
};
