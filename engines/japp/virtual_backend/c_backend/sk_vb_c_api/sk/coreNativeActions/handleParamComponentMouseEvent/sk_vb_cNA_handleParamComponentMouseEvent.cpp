#pragma once
#include <JuceHeader.h>

#include "SK_vb_cNA_handleParamComponentMouseEvent.h"

#include "../../../../sk_vbe/sk_vbe.hxx"
#include "../src/Editor.hxx"
#include "../src/Processor.hxx"

SK_VB_cNA_handleParamComponentMouseEvent::SK_VB_cNA_handleParamComponentMouseEvent(SK_VirtualBackend* _vbe) {
    vbe = _vbe;
}

void SK_VB_cNA_handleParamComponentMouseEvent::handle_IPC_Msg(String msgID, DynamicObject* obj, String& responseData) {
    var info = obj->getProperty("data");

    String jcID = info.getProperty("jcID", "");
    String event = info.getProperty("event", "");
    String button = info.getProperty("button", "");

    int left = info.getProperty("left", "");
    int top = info.getProperty("top", "");

    if (event == "contextmenu") {
        if (JUCEApplicationBase::isStandaloneApp()) {
            SK_IPC::respondWithError(msgID, "standalone_runtime", responseData);
            return;
        }

        RangedAudioParameter* param = vbe->editor->m_processor.state.getParameter(jcID);
        auto ctx = vbe->editor->getHostContext();
        std::unique_ptr<juce::HostProvidedContextMenu> menu = ctx->getContextMenuForParameter(param);

        menu.get()->showNativeMenu(Point<int>{left, top});

        return;
    }

}