#pragma once

#include <JuceHeader.h>
#include <juce_gui_extra/juce_gui_extra.h>

#include "../../../../../../sk_vb_binarydata.hxx"

#include "../sk_vb_c_api/sk_vb_c_api.h"

class SK_Compatible_Editor;

class SK_VirtualBackend : public juce::WebBrowserComponent {
public:

    using juce::WebBrowserComponent::WebBrowserComponent;

    #if JUCE_DEBUG
        String mode = "debug";
    #else
        String mode = "release";
    #endif

    SK_Compatible_Editor* editor;

    SK_VB_BinaryData sk_bd;

    SK_C_API* sk_c_api = new SK_C_API(this);

    auto pageAboutToLoad(const juce::String& newUrl) -> bool override;

    auto createResource(const juce::String& resourceName) -> juce::WebBrowserComponent::Resource;

    auto lookUpMimeType(const juce::String& filename, const juce::String& defaultMimeType = "application/octet-stream") -> juce::String;


    auto handle_native_command(juce::String url) -> std::optional<juce::WebBrowserComponent::Resource>;

    

    void handle_sk_ipc_msg(const var& object) {
        juce::DynamicObject* obj = object.getDynamicObject();

        sk_c_api->ipc->handle_IPC_Msg(obj);
    };

    void handle_ipc_msg_from_view(const String& sk_ipc_msg);
};
