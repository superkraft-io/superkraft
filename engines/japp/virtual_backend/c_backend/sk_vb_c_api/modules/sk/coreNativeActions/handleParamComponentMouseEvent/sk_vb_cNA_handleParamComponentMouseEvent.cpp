#pragma once
#include <JuceHeader.h>

#include "SK_vb_cNA_handleParamComponentMouseEvent.h"

#include "../../../../../sk_vbe/sk_vbe.hxx"
#include "../src/Editor.hxx"
#include "../src/Processor.hxx"

SK_VB_cNA_handleParamComponentMouseEvent::SK_VB_cNA_handleParamComponentMouseEvent(SK_VirtualBackend* _vbe) {
    vbe = _vbe;
}

void SK_VB_cNA_handleParamComponentMouseEvent::handle_IPC_Msg(String msgID, DynamicObject* obj, String& responseData) {
    var info = obj->getProperty("data");

    String juceParamID = info.getProperty("juceParamID", "");
    RangedAudioParameter* param = vbe->editor->m_processor.state.getParameter(juceParamID);

    if (param == NULL) return SK_IPC::respondWithError(msgID, "invalid_juce_param_id", responseData);

    String event = info.getProperty("event", "");

    if (event == "read") {
        responseData = "{\"value\": \"" + String(param->getValue()) + "\"}";
        //DBG(responseData);
        return;
    }


    if (event == "contextmenu") {
        if (JUCEApplicationBase::isStandaloneApp()) {
            SK_IPC::respondWithError(msgID, "standalone_runtime", responseData);
            return;
        }

        int left = info.getProperty("left", "");
        int top = info.getProperty("top", "");

       
        auto ctx = vbe->editor->getHostContext();
        std::unique_ptr<juce::HostProvidedContextMenu> menu = ctx->getContextMenuForParameter(param);

        menu.get()->showNativeMenu(Point<int>{left, top});

        return;
    }


    if (event == "mousedown") return param->beginChangeGesture();
    if (event == "mouseup") return param->endChangeGesture();

    if (event == "write") {
        float value = info.getProperty("value", 0);
        const auto normalisedValue = param->convertTo0to1(value);
        param->setValueNotifyingHost(normalisedValue);
        return;
    }

   
}
