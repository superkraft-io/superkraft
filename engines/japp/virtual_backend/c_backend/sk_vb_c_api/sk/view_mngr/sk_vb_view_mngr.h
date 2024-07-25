#pragma once


#include <JuceHeader.h>
#include "sk_vb_view/sk_vb_view.hxx"

class SK_VirtualBackend;

class SK_VB_View_Mngr {
public:
    SK_VirtualBackend* vbe;

    std::vector<SK_VB_ViewMngr_View*> views;

    SK_VB_View_Mngr(SK_VirtualBackend *_vbe);
    
    void SK_VB_View_Mngr::resizeViews(int width, int height);
    SK_VB_ViewMngr_View* SK_VB_View_Mngr::findViewByID(String viewID);

    void SK_VB_View_Mngr::handle_IPC_Msg(String msgID, DynamicObject* obj, String& responseData);
    void SK_VB_View_Mngr::createView(String msgID, var obj, String& responseData);
};
